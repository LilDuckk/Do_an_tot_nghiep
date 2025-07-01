from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django.db import transaction, connection
from django.db.models import Sum, Count, Avg, Q, F, DecimalField
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from rest_framework.permissions import OR

from apps.orders.models.order import Orders
from apps.orders.models.order_detail import OrderDetail
from apps.inventory.models.inventory import Inventory
from apps.inventory.models.inventory_transaction import InventoryTransaction
from apps.purchases.models.goods_receipt import GoodsReceipt
from apps.purchases.models.purchase_order import PurchaseOrder
from apps.stores.models.store import Store
from apps.stores.models.employee import Employee
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee

class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet cho dashboard tổng hợp - Sử dụng SQL queries tối ưu
    """
    
    def get_permissions(self):
        """Tùy chỉnh permission"""
        return [OR(IsSuperUser(), IsStoreEmployee())]

    def get_user_store_filter(self):
        """Lấy điều kiện lọc theo cửa hàng của user"""
        user = self.request.user
        
        if user.is_superuser:
            return ""
        
        try:
            employee = Employee.objects.get(user=user, is_deleted=False)
            user_store = employee.store
            return f"AND o.store_id = {user_store.id}"
        except Employee.DoesNotExist:
            return "AND 1=0"  # Không có quyền

    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Tổng quan dashboard - SQL tối ưu"""
        try:
            # Lấy tham số
            period = request.query_params.get('period', 'today')  # today, week, month, year
            store_id = request.query_params.get('store_id')
            
            # Tính ngày bắt đầu và kết thúc
            end_date = timezone.now()
            if period == 'today':
                start_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
            elif period == 'week':
                start_date = end_date - timedelta(days=7)
            elif period == 'month':
                start_date = end_date - timedelta(days=30)
            else:  # year
                start_date = end_date - timedelta(days=365)
            
            # Điều kiện lọc theo cửa hàng
            store_filter = ""
            if store_id:
                store_filter = f"AND o.store_id = {store_id}"
            else:
                store_filter = self.get_user_store_filter()
            
            # SQL query tối ưu cho tổng quan
            with connection.cursor() as cursor:
                # Query doanh thu và đơn hàng
                cursor.execute(f"""
                    SELECT 
                        COUNT(DISTINCT o.id) as total_orders,
                        SUM(o.total_amount) as gross_revenue,
                        SUM(od.quantity) as total_items,
                        COUNT(DISTINCT o.customer_id) as total_customers,
                        AVG(o.total_amount) as average_order_value,
                        SUM(od.unit_price * od.quantity - od.final_price) as total_discounts
                    FROM orders o
                    LEFT JOIN orderdetail od ON o.id = od.order_id AND od.is_deleted = FALSE
                    WHERE o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        {store_filter}
                """, [start_date, end_date])
                
                revenue_result = cursor.fetchone()
                
                # Query đơn hàng theo trạng thái
                cursor.execute(f"""
                    SELECT 
                        o.status,
                        COUNT(o.id) as count,
                        SUM(o.total_amount) as total_amount
                    FROM orders o
                    WHERE o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.is_deleted = FALSE
                        {store_filter}
                    GROUP BY o.status
                """, [start_date, end_date])
                
                status_results = cursor.fetchall()
                
                # Query tồn kho
                inventory_store_filter = store_filter.replace('o.store_id', 'inv.store_id') if store_filter else ""
                cursor.execute(f"""
                    SELECT 
                        COUNT(DISTINCT inv.product_variant_id) as total_products,
                        SUM(inv.quantity) as total_stock,
                        COUNT(CASE WHEN inv.quantity = 0 THEN 1 END) as out_of_stock_count,
                        COUNT(CASE WHEN inv.quantity <= 5 THEN 1 END) as low_stock_count
                    FROM inventory inv
                    WHERE inv.is_deleted = FALSE
                        {inventory_store_filter}
                """)
                
                inventory_result = cursor.fetchall()
                
                # Query so sánh với kỳ trước
                prev_start_date = start_date - (end_date - start_date)
                cursor.execute(f"""
                    SELECT 
                        COUNT(DISTINCT o.id) as total_orders,
                        SUM(o.total_amount) as gross_revenue
                    FROM orders o
                    WHERE o.order_date >= %s 
                        AND o.order_date < %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        {store_filter}
                """, [prev_start_date, start_date])
                
                prev_period_result = cursor.fetchone()
            
            # Xử lý kết quả doanh thu
            total_orders, gross_revenue, total_items, total_customers, avg_order_value, total_discounts = revenue_result
            gross_revenue = gross_revenue or Decimal('0')
            total_discounts = total_discounts or Decimal('0')
            net_revenue = gross_revenue - total_discounts
            
            # Xử lý kết quả trạng thái đơn hàng
            order_status = {}
            for row in status_results:
                order_status_value, count, amount = row
                order_status[order_status_value] = {
                    'count': count,
                    'total_amount': float(amount or 0)
                }
            
            # Xử lý kết quả tồn kho
            inventory_data = {}
            if inventory_result:
                total_products, total_stock, out_of_stock_count, low_stock_count = inventory_result[0]
                inventory_data = {
                    'total_products': total_products or 0,
                    'total_stock': total_stock or 0,
                    'out_of_stock_count': out_of_stock_count or 0,
                    'low_stock_count': low_stock_count or 0
                }
            
            # Xử lý so sánh với kỳ trước
            prev_orders, prev_revenue = prev_period_result
            prev_revenue = prev_revenue or Decimal('0')
            
            revenue_growth = 0
            if prev_revenue > 0:
                revenue_growth = float(((gross_revenue - prev_revenue) / prev_revenue) * 100)
            
            order_growth = 0
            if prev_orders and prev_orders > 0:
                order_growth = float(((total_orders - prev_orders) / prev_orders) * 100)
            
            overview_data = {
                'period': {
                    'type': period,
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                },
                'revenue': {
                    'gross_revenue': float(gross_revenue),
                    'net_revenue': float(net_revenue),
                    'total_discounts': float(total_discounts),
                    'discount_rate': float((total_discounts / gross_revenue * 100) if gross_revenue else 0),
                    'revenue_growth': revenue_growth
                },
                'orders': {
                    'total_orders': total_orders,
                    'total_items': total_items or 0,
                    'total_customers': total_customers,
                    'average_order_value': float(avg_order_value or 0),
                    'order_growth': order_growth,
                    'status_breakdown': order_status
                },
                'inventory': inventory_data,
                'performance_metrics': {
                    'conversion_rate': 0,  # TODO: Tính từ traffic data
                    'customer_satisfaction': 0,  # TODO: Tính từ feedback
                    'inventory_turnover': 0  # TODO: Tính từ historical data
                }
            }
            
            return Response(overview_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        """Hoạt động gần đây - SQL tối ưu"""
        try:
            # Lấy tham số
            limit = int(request.query_params.get('limit', 20))
            store_id = request.query_params.get('store_id')
            
            # Điều kiện lọc theo cửa hàng
            store_filter = ""
            if store_id:
                store_filter = f"AND o.store_id = {store_id}"
            else:
                store_filter = self.get_user_store_filter()
            
            # SQL query tối ưu cho hoạt động gần đây
            with connection.cursor() as cursor:
                # Query đơn hàng gần đây
                cursor.execute(f"""
                    SELECT 
                        o.id,
                        o.order_date,
                        o.status,
                        o.total_amount,
                        c.first_name,
                        c.last_name,
                        c.email,
                        COUNT(od.id) as item_count
                    FROM orders o
                    LEFT JOIN customer c ON o.customer_id = c.id
                    LEFT JOIN orderdetail od ON o.id = od.order_id AND od.is_deleted = FALSE
                    WHERE o.is_deleted = FALSE
                        {store_filter}
                    GROUP BY o.id, o.order_date, o.status, o.total_amount, c.first_name, c.last_name, c.email
                    ORDER BY o.order_date DESC
                    LIMIT %s
                """, [limit])
                
                order_results = cursor.fetchall()
                
                # Query giao dịch kho gần đây
                inventory_store_filter = store_filter.replace('o.store_id', 'inv.store_id') if store_filter else ""
                cursor.execute(f"""
                    SELECT 
                        it.id,
                        it.transaction_date,
                        it.transaction_type,
                        it.quantity,
                        it.reference_type,
                        it.reference_id,
                        pv.sku,
                        p.name as product_name,
                        s.name as store_name
                    FROM inventorytransaction it
                    JOIN inventory inv ON it.inventory_id = inv.id
                    JOIN productvariant pv ON inv.product_variant_id = pv.id
                    JOIN product p ON pv.product_id = p.id
                    JOIN store s ON inv.store_id = s.id
                    WHERE it.is_deleted = FALSE
                        {inventory_store_filter}
                    ORDER BY it.transaction_date DESC
                    LIMIT %s
                """, [limit])
                
                transaction_results = cursor.fetchall()
            
            # Xử lý kết quả đơn hàng
            recent_orders = []
            for row in order_results:
                order_id, order_date, order_status, total_amount, first_name, last_name, email, item_count = row
                recent_orders.append({
                    'id': order_id,
                    'type': 'order',
                    'date': order_date.isoformat() if order_date else None,
                    'status': order_status,
                    'total_amount': float(total_amount or 0),
                    'customer_name': f"{first_name or ''} {last_name or ''}".strip(),
                    'customer_email': email,
                    'item_count': item_count,
                    'description': f"Đơn hàng #{order_id} - {item_count} sản phẩm"
                })
            
            # Xử lý kết quả giao dịch kho
            recent_transactions = []
            for row in transaction_results:
                trans_id, trans_date, trans_type, quantity, ref_type, ref_id, sku, product_name, store_name = row
                recent_transactions.append({
                    'id': trans_id,
                    'type': 'inventory',
                    'date': trans_date.isoformat() if trans_date else None,
                    'transaction_type': trans_type,
                    'quantity': quantity,
                    'reference_type': ref_type,
                    'reference_id': ref_id,
                    'sku': sku,
                    'product_name': product_name,
                    'store_name': store_name,
                    'description': f"{trans_type} {quantity} {product_name} ({sku})"
                })
            
            # Kết hợp và sắp xếp theo thời gian
            all_activities = recent_orders + recent_transactions
            all_activities.sort(key=lambda x: x['date'] or '', reverse=True)
            
            return Response({
                'recent_activities': all_activities[:limit],
                'order_activities': recent_orders,
                'inventory_activities': recent_transactions
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def alerts(self, request):
        """Cảnh báo và thông báo - SQL tối ưu"""
        try:
            # Lấy tham số
            store_id = request.query_params.get('store_id')
            
            # Điều kiện lọc theo cửa hàng
            store_filter = ""
            if store_id:
                store_filter = f"AND o.store_id = {store_id}"
            else:
                store_filter = self.get_user_store_filter()
            
            alerts = []
            
            # SQL query tối ưu cho các cảnh báo
            with connection.cursor() as cursor:
                # Cảnh báo tồn kho thấp
                inventory_store_filter = store_filter.replace('o.store_id', 'inv.store_id') if store_filter else ""
                cursor.execute(f"""
                    SELECT 
                        inv.product_variant_id,
                        pv.sku,
                        p.name as product_name,
                        inv.quantity,
                        s.name as store_name
                    FROM inventory inv
                    JOIN productvariant pv ON inv.product_variant_id = pv.id
                    JOIN product p ON pv.product_id = p.id
                    JOIN store s ON inv.store_id = s.id
                    WHERE inv.quantity <= 5 
                        AND inv.quantity > 0
                        AND inv.is_deleted = FALSE
                        {inventory_store_filter}
                    ORDER BY inv.quantity ASC
                """)
                
                low_stock_results = cursor.fetchall()
                
                # Cảnh báo hết hàng
                cursor.execute(f"""
                    SELECT 
                        inv.product_variant_id,
                        pv.sku,
                        p.name as product_name,
                        s.name as store_name
                    FROM inventory inv
                    JOIN productvariant pv ON inv.product_variant_id = pv.id
                    JOIN product p ON pv.product_id = p.id
                    JOIN store s ON inv.store_id = s.id
                    WHERE inv.quantity = 0
                        AND inv.is_deleted = FALSE
                        {inventory_store_filter}
                """)
                
                out_of_stock_results = cursor.fetchall()
                
                # Cảnh báo đơn hàng chờ xử lý
                cursor.execute(f"""
                    SELECT 
                        o.id,
                        o.order_date,
                        o.total_amount,
                        c.first_name,
                        c.last_name,
                        c.email
                    FROM orders o
                    LEFT JOIN customer c ON o.customer_id = c.id
                    WHERE o.status = 'pending'
                        AND o.is_deleted = FALSE
                        {store_filter}
                    ORDER BY o.order_date ASC
                """)
                
                pending_orders_results = cursor.fetchall()
            
            # Xử lý cảnh báo tồn kho thấp
            for row in low_stock_results:
                product_variant_id, sku, product_name, quantity, store_name = row
                alerts.append({
                    'type': 'low_stock',
                    'severity': 'warning',
                    'title': 'Tồn kho thấp',
                    'message': f"Sản phẩm {product_name} ({sku}) chỉ còn {quantity} trong kho",
                    'data': {
                        'product_variant_id': product_variant_id,
                        'sku': sku,
                        'product_name': product_name,
                        'quantity': quantity,
                        'store_name': store_name
                    }
                })
            
            # Xử lý cảnh báo hết hàng
            for row in out_of_stock_results:
                product_variant_id, sku, product_name, store_name = row
                alerts.append({
                    'type': 'out_of_stock',
                    'severity': 'error',
                    'title': 'Hết hàng',
                    'message': f"Sản phẩm {product_name} ({sku}) đã hết hàng",
                    'data': {
                        'product_variant_id': product_variant_id,
                        'sku': sku,
                        'product_name': product_name,
                        'store_name': store_name
                    }
                })
            
            # Xử lý cảnh báo đơn hàng chờ
            for row in pending_orders_results:
                order_id, order_date, total_amount, first_name, last_name, email = row
                customer_name = f"{first_name or ''} {last_name or ''}".strip()
                alerts.append({
                    'type': 'pending_order',
                    'severity': 'info',
                    'title': 'Đơn hàng chờ xử lý',
                    'message': f"Đơn hàng #{order_id} của {customer_name} chờ xử lý",
                    'data': {
                        'order_id': order_id,
                        'order_date': order_date.isoformat(),
                        'total_amount': float(total_amount or 0),
                        'customer_name': customer_name,
                        'customer_email': email
                    }
                })
            
            # Thống kê cảnh báo
            alert_summary = {
                'total_alerts': len(alerts),
                'low_stock_count': len([a for a in alerts if a['type'] == 'low_stock']),
                'out_of_stock_count': len([a for a in alerts if a['type'] == 'out_of_stock']),
                'pending_orders_count': len([a for a in alerts if a['type'] == 'pending_order']),
                'error_count': len([a for a in alerts if a['severity'] == 'error']),
                'warning_count': len([a for a in alerts if a['severity'] == 'warning']),
                'info_count': len([a for a in alerts if a['severity'] == 'info'])
            }
            
            return Response({
                'alerts': alerts,
                'summary': alert_summary
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 