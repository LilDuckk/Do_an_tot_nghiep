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
from apps.orders.models.return_order import ReturnOrder
from apps.orders.models.return_order_detail import ReturnOrderDetail
from apps.warranty.models.warranty import Warranty
from apps.warranty.models.warranty_claim import WarrantyClaim
from apps.inventory.models.inventory import Inventory
from apps.inventory.models.inventory_transaction import InventoryTransaction
from apps.purchases.models.goods_receipt import GoodsReceipt
from apps.purchases.models.purchase_order import PurchaseOrder
from apps.stores.models.store import Store
from apps.stores.models.employee import Employee
from apps.core.utils.permissions import IsSuperUser, ViewReportsPermission

class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet cho dashboard tổng hợp - Sử dụng SQL queries tối ưu
    """
    
    def get_permissions(self):
        """Tùy chỉnh permission"""
        return [OR(IsSuperUser(), ViewReportsPermission())]

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
                'alert_count': len(alerts)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def comprehensive_analysis(self, request):
        """Phân tích tổng hợp bao gồm return orders, warranty và chỉ số tài chính"""
        try:
            # Lấy tham số
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            store_id = request.query_params.get('store_id')
            
            # Xử lý ngày
            if not start_date:
                start_date = (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            if not end_date:
                end_date = timezone.now().strftime('%Y-%m-%d')
            
            # Điều kiện lọc theo cửa hàng
            store_filter = ""
            if store_id:
                store_filter = f"AND o.store_id = {store_id}"
            else:
                store_filter = self.get_user_store_filter()
            
            with connection.cursor() as cursor:
                # 1. Thống kê Return Orders
                cursor.execute(f"""
                    SELECT 
                        COUNT(DISTINCT ro.id) as total_return_orders,
                        COUNT(rod.id) as total_returned_items,
                        SUM(COALESCE(rod.quantity, 0)) as total_returned_quantity,
                        SUM(COALESCE(ro.refund_amount, 0)) as total_refund_amount,
                        COUNT(CASE WHEN ro.status = 'PENDING' THEN 1 END) as pending_returns,
                        COUNT(CASE WHEN ro.status = 'APPROVED' THEN 1 END) as approved_returns,
                        COUNT(CASE WHEN ro.status = 'COMPLETED' THEN 1 END) as completed_returns,
                        COUNT(CASE WHEN ro.status = 'REJECTED' THEN 1 END) as rejected_returns,
                        AVG(ro.refund_amount) as average_refund_amount
                    FROM returnorder ro
                    LEFT JOIN returnorderdetail rod ON ro.id = rod.return_order_id AND rod.is_deleted = FALSE
                    LEFT JOIN orders o ON ro.order_id = o.id
                    WHERE ro.return_date >= %s 
                        AND ro.return_date <= %s 
                        AND ro.is_deleted = FALSE
                        {store_filter}
                """, [start_date, end_date])
                
                return_stats = cursor.fetchone()
                
                # 2. Thống kê Warranty
                cursor.execute(f"""
                    SELECT 
                        COUNT(DISTINCT w.id) as total_warranties,
                        COUNT(DISTINCT wc.id) as total_warranty_claims,
                        COUNT(CASE WHEN w.status = 'ACTIVE' THEN 1 END) as active_warranties,
                        COUNT(CASE WHEN w.status = 'EXPIRED' THEN 1 END) as expired_warranties,
                        COUNT(CASE WHEN w.status = 'CLAIMED' THEN 1 END) as claimed_warranties,
                        COUNT(CASE WHEN wc.status = 'PENDING' THEN 1 END) as pending_claims,
                        COUNT(CASE WHEN wc.status = 'COMPLETED' THEN 1 END) as completed_claims,
                        SUM(COALESCE(wc.repair_cost, 0)) as total_repair_cost,
                        AVG(wc.repair_cost) as average_repair_cost
                    FROM warranty w
                    LEFT JOIN warrantyclaim wc ON w.id = wc.warranty_id AND wc.is_deleted = FALSE
                    LEFT JOIN orderdetail od ON w.order_detail_id = od.id
                    LEFT JOIN orders o ON od.order_id = o.id
                    WHERE w.warranty_start_date >= %s 
                        AND w.warranty_start_date <= %s 
                        AND w.is_deleted = FALSE
                        {store_filter}
                """, [start_date, end_date])
                
                warranty_stats = cursor.fetchone()
                
                # 3. Thống kê doanh thu và chi phí
                cursor.execute(f"""
                    SELECT 
                        SUM(o.total_amount) as total_revenue,
                        COUNT(DISTINCT o.id) as total_orders,
                        SUM(od.quantity) as total_items_sold,
                        SUM(COALESCE(od.unit_price * od.quantity - od.final_price, 0)) as total_discounts
                    FROM orders o
                    LEFT JOIN orderdetail od ON o.id = od.order_id AND od.is_deleted = FALSE
                    WHERE o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        {store_filter}
                """, [start_date, end_date])
                
                revenue_stats = cursor.fetchone()
                if revenue_stats:
                    total_revenue, total_orders, total_items_sold, total_discounts = revenue_stats
                else:
                    total_revenue, total_orders, total_items_sold, total_discounts = 0, 0, 0, 0

                # 4. Thống kê chi phí nhập hàng
                cursor.execute(f"""
                    SELECT 
                        SUM(gr.total_amount) as total_purchase_cost,
                        COUNT(DISTINCT gr.id) as total_purchase_orders,
                        SUM(grd.accepted_quantity) as total_items_purchased
                    FROM goods_receipts gr
                    LEFT JOIN goods_receipt_details grd ON gr.id = grd.goods_receipt_id AND grd.is_deleted = FALSE
                    LEFT JOIN store s ON gr.store_id = s.id
                    WHERE gr.receipt_date >= %s 
                        AND gr.receipt_date <= %s 
                        AND gr.is_deleted = FALSE
                        {store_filter.replace('o.store_id', 'gr.store_id')}
                """, [start_date, end_date])
                
                purchase_stats = cursor.fetchone()
                if purchase_stats:
                    total_purchase_cost, total_purchase_orders, total_items_purchased = purchase_stats
                else:
                    total_purchase_cost, total_purchase_orders, total_items_purchased = 0, 0, 0

                # 5. Thống kê lợi nhuận theo sản phẩm
                cursor.execute(f"""
                    SELECT 
                        od.product_variant_id,
                        pv.sku,
                        p.name as product_name,
                        SUM(od.quantity) as sold_quantity,
                        SUM(od.final_price) as sold_revenue,
                        SUM(COALESCE(rod.quantity, 0)) as returned_quantity,
                        SUM(COALESCE(ro.refund_amount, 0)) as refund_amount,
                        COUNT(DISTINCT wc.id) as warranty_claims,
                        SUM(COALESCE(wc.repair_cost, 0)) as repair_cost
                    FROM orderdetail od
                    JOIN orders o ON od.order_id = o.id
                    JOIN productvariant pv ON od.product_variant_id = pv.id
                    JOIN product p ON pv.product_id = p.id
                    LEFT JOIN returnorderdetail rod ON od.id = rod.order_detail_id AND rod.is_deleted = FALSE
                    LEFT JOIN returnorder ro ON rod.return_order_id = ro.id AND ro.is_deleted = FALSE
                    LEFT JOIN warranty w ON od.id = w.order_detail_id AND w.is_deleted = FALSE
                    LEFT JOIN warrantyclaim wc ON w.id = wc.warranty_id AND wc.is_deleted = FALSE
                    WHERE o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        AND od.is_deleted = FALSE
                        {store_filter}
                    GROUP BY od.product_variant_id, pv.sku, p.name
                    ORDER BY sold_revenue DESC
                    LIMIT 20
                """, [start_date, end_date])
                
                product_profit_results = cursor.fetchall()
            
            # Xử lý kết quả Return Orders
            (total_return_orders, total_returned_items, total_returned_quantity, total_refund_amount, 
             pending_returns, approved_returns, completed_returns, rejected_returns, average_refund_amount) = return_stats
            
            return_analysis = {
                'total_return_orders': total_return_orders or 0,
                'total_returned_items': total_returned_items or 0,
                'total_returned_quantity': total_returned_quantity or 0,
                'total_refund_amount': float(total_refund_amount or 0),
                'average_refund_amount': float(average_refund_amount or 0),
                'status_breakdown': {
                    'pending': pending_returns or 0,
                    'approved': approved_returns or 0,
                    'completed': completed_returns or 0,
                    'rejected': rejected_returns or 0
                },
                'return_rate': 0  # Sẽ tính bên dưới
            }
            
            # Xử lý kết quả Warranty
            (total_warranties, total_warranty_claims, active_warranties, expired_warranties, 
             claimed_warranties, pending_claims, completed_claims, total_repair_cost, average_repair_cost) = warranty_stats
            
            warranty_analysis = {
                'total_warranties': total_warranties or 0,
                'total_warranty_claims': total_warranty_claims or 0,
                'total_repair_cost': float(total_repair_cost or 0),
                'average_repair_cost': float(average_repair_cost or 0),
                'warranty_status': {
                    'active': active_warranties or 0,
                    'expired': expired_warranties or 0,
                    'claimed': claimed_warranties or 0
                },
                'claim_status': {
                    'pending': pending_claims or 0,
                    'completed': completed_claims or 0
                },
                'claim_rate': (total_warranty_claims / total_warranties * 100) if total_warranties else 0
            }
            
            # Xử lý kết quả doanh thu
            total_revenue, total_orders, total_items_sold, total_discounts = revenue_stats
            total_revenue = total_revenue or Decimal('0')
            total_discounts = total_discounts or Decimal('0')
            net_revenue = total_revenue - total_discounts
            
            # Xử lý kết quả chi phí nhập hàng
            total_purchase_cost, total_purchase_orders, total_items_purchased = purchase_stats
            total_purchase_cost = total_purchase_cost or Decimal('0')
            
            # Tính toán các chỉ số tài chính
            gross_profit = net_revenue - total_purchase_cost
            gross_profit_margin = (gross_profit / net_revenue * 100) if net_revenue else 0
            
            # Tính return rate
            return_rate = (total_returned_quantity / total_items_sold * 100) if total_items_sold else 0
            return_analysis['return_rate'] = return_rate
            
            # Xử lý kết quả lợi nhuận theo sản phẩm
            product_profit_analysis = []
            for row in product_profit_results:
                (product_variant_id, sku, product_name, sold_quantity, sold_revenue, 
                 returned_quantity, refund_amount, warranty_claims, repair_cost) = row
                
                sold_revenue = sold_revenue or Decimal('0')
                refund_amount = refund_amount or Decimal('0')
                repair_cost = repair_cost or Decimal('0')
                
                # Ước tính chi phí nhập hàng (cần cải thiện bằng cách join với purchase data)
                estimated_cost = sold_revenue * Decimal('0.6')  # Giả sử 60% là chi phí
                net_profit = sold_revenue - refund_amount - repair_cost - estimated_cost
                
                product_profit_analysis.append({
                    'product_variant_id': product_variant_id,
                    'sku': sku,
                    'product_name': product_name,
                    'sold_quantity': sold_quantity or 0,
                    'sold_revenue': float(sold_revenue),
                    'returned_quantity': returned_quantity or 0,
                    'refund_amount': float(refund_amount),
                    'warranty_claims': warranty_claims or 0,
                    'repair_cost': float(repair_cost),
                    'estimated_cost': float(estimated_cost),
                    'net_profit': float(net_profit),
                    'profit_margin': float((net_profit / sold_revenue * 100) if sold_revenue else 0)
                })
            
            comprehensive_data = {
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'financial_summary': {
                    'total_revenue': float(total_revenue),
                    'net_revenue': float(net_revenue),
                    'total_discounts': float(total_discounts),
                    'total_purchase_cost': float(total_purchase_cost),
                    'gross_profit': float(gross_profit),
                    'gross_profit_margin': float(gross_profit_margin),
                    'total_refund_amount': float(total_refund_amount or 0),
                    'total_repair_cost': float(total_repair_cost or 0),
                    'net_profit': float(gross_profit - total_refund_amount - total_repair_cost)
                },
                'return_analysis': return_analysis,
                'warranty_analysis': warranty_analysis,
                'operational_metrics': {
                    'total_orders': total_orders or 0,
                    'total_items_sold': total_items_sold or 0,
                    'total_items_purchased': total_items_purchased or 0,
                    'total_purchase_orders': total_purchase_orders or 0,
                    'return_rate': return_rate,
                    'average_order_value': float(total_revenue / total_orders) if total_orders else 0
                },
                'product_profit_analysis': product_profit_analysis
            }
            
            return Response(comprehensive_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 