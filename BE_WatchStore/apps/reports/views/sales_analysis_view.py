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
from apps.products.models.variant import ProductVariant
from apps.products.models.product import Product
from apps.inventory.models.inventory import Inventory
from apps.inventory.models.inventory_transaction import InventoryTransaction
from apps.stores.models.store import Store
from apps.stores.models.employee import Employee
from apps.core.utils.permissions import IsSuperUser, ViewReportsPermission

class SalesAnalysisViewSet(viewsets.ViewSet):
    """
    ViewSet cho phân tích bán hàng - Sử dụng SQL queries tối ưu
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
    def best_sellers(self, request):
        """Sản phẩm bán chạy nhất - SQL tối ưu"""
        try:
            # Lấy tham số
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            store_id = request.query_params.get('store_id')
            limit = int(request.query_params.get('limit', 10))
            
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
            
            # SQL query tối ưu
            with connection.cursor() as cursor:
                cursor.execute(f"""
                    SELECT 
                        od.product_variant_id,
                        pv.sku,
                        p.name as product_name,
                        b.name as brand_name,
                        SUM(od.quantity) as total_quantity,
                        SUM(od.final_price) as total_revenue,
                        COUNT(DISTINCT o.id) as total_orders,
                        AVG(od.unit_price) as average_price,
                        SUM(od.unit_price * od.quantity - od.final_price) as total_discount,
                        COALESCE(inv.quantity, 0) as current_stock
                    FROM orderdetail od
                    JOIN orders o ON od.order_id = o.id
                    JOIN productvariant pv ON od.product_variant_id = pv.id
                    JOIN product p ON pv.product_id = p.id
                    LEFT JOIN brand b ON p.brand_id = b.id
                    LEFT JOIN inventory inv ON pv.id = inv.product_variant_id AND inv.is_deleted = FALSE
                    WHERE o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        AND od.is_deleted = FALSE
                        {store_filter}
                    GROUP BY od.product_variant_id, pv.sku, p.name, b.name, inv.quantity
                    ORDER BY total_quantity DESC
                    LIMIT %s
                """, [start_date, end_date, limit])
                
                results = cursor.fetchall()
            
            # Xử lý kết quả
            best_sellers = []
            total_summary = {
                'total_products': 0,
                'total_quantity_sold': 0,
                'total_revenue': Decimal('0'),
                'total_net_revenue': Decimal('0'),
                'total_discounts': Decimal('0')
            }
            
            for row in results:
                product_variant_id, sku, product_name, brand_name, total_quantity, total_revenue, total_orders, average_price, total_discount, current_stock = row
                
                total_revenue = total_revenue or Decimal('0')
                total_discount = total_discount or Decimal('0')
                net_revenue = total_revenue - total_discount
                
                best_sellers.append({
                    'product_variant_id': product_variant_id,
                    'sku': sku,
                    'product_name': product_name,
                    'brand_name': brand_name,
                    'total_quantity': total_quantity,
                    'total_revenue': float(total_revenue),
                    'total_orders': total_orders,
                    'average_price': float(average_price or 0),
                    'total_discount': float(total_discount),
                    'net_revenue': float(net_revenue),
                    'current_stock': current_stock or 0,
                    'gross_profit_margin': 0,  # TODO: Tính từ giá nhập
                    'revenue_per_order': float(total_revenue / total_orders) if total_orders else 0
                })
                
                # Cộng dồn tổng kết
                total_summary['total_products'] += 1
                total_summary['total_quantity_sold'] += total_quantity
                total_summary['total_revenue'] += total_revenue
                total_summary['total_net_revenue'] += net_revenue
                total_summary['total_discounts'] += total_discount
            
            # Tính tổng kết
            summary = {
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'total_products': total_summary['total_products'],
                'total_quantity_sold': total_summary['total_quantity_sold'],
                'total_revenue': float(total_summary['total_revenue']),
                'total_net_revenue': float(total_summary['total_net_revenue']),
                'total_discounts': float(total_summary['total_discounts']),
                'average_revenue_per_product': float(total_summary['total_revenue'] / total_summary['total_products']) if total_summary['total_products'] else 0
            }
            
            return Response({
                'summary': summary,
                'best_sellers': best_sellers
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def sales_performance_by_time(self, request):
        """Hiệu suất bán hàng theo thời gian - SQL tối ưu"""
        try:
            # Lấy tham số
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            store_id = request.query_params.get('store_id')
            product_variant_id = request.query_params.get('product_variant_id')
            period_type = request.query_params.get('period_type', 'daily')  # daily, weekly, monthly
            
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
            
            # Điều kiện lọc theo sản phẩm
            product_filter = ""
            if product_variant_id:
                product_filter = f"AND od.product_variant_id = {product_variant_id}"
            
            # SQL query tối ưu theo loại kỳ
            if period_type == 'daily':
                group_by = "DATE(o.order_date)"
                select_period = "DATE(o.order_date) as period"
            elif period_type == 'monthly':
                group_by = "EXTRACT(MONTH FROM o.order_date)"
                select_period = "EXTRACT(MONTH FROM o.order_date) as period"
            else:  # weekly
                group_by = "EXTRACT(WEEK FROM o.order_date)"
                select_period = "EXTRACT(WEEK FROM o.order_date) as period"
            
            with connection.cursor() as cursor:
                cursor.execute(f"""
                    SELECT 
                        {select_period},
                        SUM(od.quantity) as total_quantity,
                        SUM(od.final_price) as total_revenue,
                        COUNT(DISTINCT o.id) as total_orders,
                        SUM(od.unit_price * od.quantity - od.final_price) as total_discount
                    FROM orderdetail od
                    JOIN orders o ON od.order_id = o.id
                    WHERE o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        AND od.is_deleted = FALSE
                        {store_filter}
                        {product_filter}
                    GROUP BY {group_by}
                    ORDER BY period
                """, [start_date, end_date])
                
                results = cursor.fetchall()
            
            # Xử lý kết quả
            performance_data = []
            total_summary = {
                'total_quantity': 0,
                'total_revenue': Decimal('0'),
                'total_net_revenue': Decimal('0'),
                'total_orders': 0,
                'total_discounts': Decimal('0')
            }
            
            for row in results:
                period, total_quantity, total_revenue, total_orders, total_discount = row
                
                total_revenue = total_revenue or Decimal('0')
                total_discount = total_discount or Decimal('0')
                net_revenue = total_revenue - total_discount
                
                # Tạo label cho period
                if period_type == 'daily':
                    period_label = period.strftime('%Y-%m-%d')
                elif period_type == 'monthly':
                    period_label = datetime(timezone.now().year, int(period), 1).strftime('%B')
                else:  # weekly
                    period_label = f"Week {period}"
                
                performance_data.append({
                    'period': period,
                    'period_label': period_label,
                    'total_quantity': total_quantity,
                    'total_revenue': float(total_revenue),
                    'total_orders': total_orders,
                    'total_discount': float(total_discount),
                    'net_revenue': float(net_revenue),
                    'average_quantity_per_order': float(total_quantity / total_orders) if total_orders else 0,
                    'average_revenue_per_order': float(total_revenue / total_orders) if total_orders else 0,
                    'discount_rate': float((total_discount / total_revenue * 100) if total_revenue else 0)
                })
                
                # Cộng dồn tổng kết
                total_summary['total_quantity'] += total_quantity
                total_summary['total_revenue'] += total_revenue
                total_summary['total_net_revenue'] += net_revenue
                total_summary['total_orders'] += total_orders
                total_summary['total_discounts'] += total_discount
            
            # Tính tổng kết
            summary = {
                'period': {
                    'start_date': start_date,
                    'end_date': end_date,
                    'period_type': period_type
                },
                'total_quantity': total_summary['total_quantity'],
                'total_revenue': float(total_summary['total_revenue']),
                'total_net_revenue': float(total_summary['total_net_revenue']),
                'total_orders': total_summary['total_orders'],
                'total_discounts': float(total_summary['total_discounts']),
                'average_quantity_per_period': float(total_summary['total_quantity'] / len(performance_data)) if performance_data else 0,
                'average_revenue_per_period': float(total_summary['total_revenue'] / len(performance_data)) if performance_data else 0
            }
            
            return Response({
                'summary': summary,
                'performance_data': performance_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def inventory_turnover(self, request):
        """Tỷ lệ luân chuyển tồn kho - SQL tối ưu"""
        try:
            # Lấy tham số
            store_id = request.query_params.get('store_id')
            limit = int(request.query_params.get('limit', 20))
            
            # Điều kiện lọc theo cửa hàng
            store_filter = ""
            if store_id:
                store_filter = f"AND o.store_id = {store_id}"
            else:
                store_filter = self.get_user_store_filter()
            
            # SQL query tối ưu
            with connection.cursor() as cursor:
                cursor.execute(f"""
                    SELECT 
                        od.product_variant_id,
                        pv.sku,
                        p.name as product_name,
                        SUM(od.quantity) as total_sold,
                        SUM(od.final_price) as total_revenue,
                        COUNT(DISTINCT o.id) as total_orders,
                        COALESCE(inv.quantity, 0) as current_stock
                    FROM orderdetail od
                    JOIN orders o ON od.order_id = o.id
                    JOIN productvariant pv ON od.product_variant_id = pv.id
                    JOIN product p ON pv.product_id = p.id
                    LEFT JOIN inventory inv ON pv.id = inv.product_variant_id AND inv.is_deleted = FALSE
                    WHERE o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        AND od.is_deleted = FALSE
                        {store_filter}
                    GROUP BY od.product_variant_id, pv.sku, p.name, inv.quantity
                    ORDER BY total_sold DESC
                    LIMIT %s
                """, [limit])
                
                results = cursor.fetchall()
            
            # Xử lý kết quả
            inventory_turnover = []
            total_summary = {
                'total_products': 0,
                'total_quantity_sold': 0,
                'total_revenue': Decimal('0'),
                'total_current_stock': 0,
                'total_turnover_rate': 0
            }
            
            for row in results:
                product_variant_id, sku, product_name, total_sold, total_revenue, total_orders, current_stock = row
                
                # Tính tỷ lệ luân chuyển
                turnover_rate = (total_sold / current_stock * 100) if current_stock > 0 else 0
                days_of_inventory = (current_stock / total_sold * 365) if total_sold > 0 else 0
                
                inventory_turnover.append({
                    'product_variant_id': product_variant_id,
                    'sku': sku,
                    'product_name': product_name,
                    'total_sold': total_sold,
                    'total_revenue': float(total_revenue or 0),
                    'total_orders': total_orders,
                    'current_stock': current_stock or 0,
                    'turnover_rate': float(turnover_rate),
                    'days_of_inventory': int(days_of_inventory),
                    'average_quantity_per_order': float(total_sold / total_orders) if total_orders else 0,
                    'revenue_per_unit': float(total_revenue / total_sold) if total_sold else 0
                })
                
                # Cộng dồn tổng kết
                total_summary['total_products'] += 1
                total_summary['total_quantity_sold'] += total_sold
                total_summary['total_revenue'] += total_revenue or 0
                total_summary['total_current_stock'] += current_stock or 0
                total_summary['total_turnover_rate'] += turnover_rate
            
            # Sắp xếp theo tỷ lệ luân chuyển
            inventory_turnover.sort(key=lambda x: x['turnover_rate'], reverse=True)
            
            # Tính tổng kết
            summary = {
                'total_products': total_summary['total_products'],
                'total_quantity_sold': total_summary['total_quantity_sold'],
                'total_revenue': float(total_summary['total_revenue']),
                'total_current_stock': total_summary['total_current_stock'],
                'average_turnover_rate': float(total_summary['total_turnover_rate'] / total_summary['total_products']) if total_summary['total_products'] else 0,
                'average_days_of_inventory': float(365 / (total_summary['total_turnover_rate'] / total_summary['total_products'])) if total_summary['total_products'] and total_summary['total_turnover_rate'] > 0 else 0
            }
            
            return Response({
                'summary': summary,
                'inventory_turnover': inventory_turnover
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def product_performance_detail(self, request):
        """Phân tích hiệu suất chi tiết của 1 sản phẩm cụ thể"""
        try:
            # Lấy tham số
            product_variant_id = request.query_params.get('product_variant_id')
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            store_id = request.query_params.get('store_id')
            
            if not product_variant_id:
                return Response(
                    {"detail": "product_variant_id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
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
                # Query thông tin cơ bản sản phẩm
                cursor.execute(f"""
                    SELECT 
                        pv.id as product_variant_id,
                        pv.sku,
                        p.name as product_name,
                        COALESCE(b.name, '') as brand_name,
                        NULL as current_price,
                        COALESCE(inv.quantity, 0) as current_stock,
                        pv.is_active
                    FROM productvariant pv
                    JOIN product p ON pv.product_id = p.id
                    LEFT JOIN brand b ON p.brand_id = b.id
                    LEFT JOIN inventory inv ON pv.id = inv.product_variant_id AND inv.is_deleted = FALSE
                    WHERE pv.id = %s
                """, [product_variant_id])
                
                product_info = cursor.fetchone()
                
                if not product_info:
                    return Response(
                        {"detail": "Product variant not found"},
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                # Query thống kê bán hàng
                cursor.execute(f"""
                    SELECT 
                        COUNT(DISTINCT o.id) as total_orders,
                        SUM(od.quantity) as total_quantity_sold,
                        SUM(od.final_price) as total_revenue,
                        SUM(od.unit_price * od.quantity - od.final_price) as total_discount,
                        AVG(od.unit_price) as average_unit_price,
                        AVG(od.final_price / od.quantity) as average_selling_price,
                        MIN(o.order_date) as first_sale_date,
                        MAX(o.order_date) as last_sale_date
                    FROM orderdetail od
                    JOIN orders o ON od.order_id = o.id
                    WHERE od.product_variant_id = %s
                        AND o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        AND od.is_deleted = FALSE
                        {store_filter}
                """, [product_variant_id, start_date, end_date])
                
                sales_stats = cursor.fetchone()
                
                # Query thống kê theo thời gian (daily)
                cursor.execute(f"""
                    SELECT 
                        DATE(o.order_date) as sale_date,
                        SUM(od.quantity) as daily_quantity,
                        SUM(od.final_price) as daily_revenue,
                        COUNT(DISTINCT o.id) as daily_orders
                    FROM orderdetail od
                    JOIN orders o ON od.order_id = o.id
                    WHERE od.product_variant_id = %s
                        AND o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        AND od.is_deleted = FALSE
                        {store_filter}
                    GROUP BY DATE(o.order_date)
                    ORDER BY sale_date
                """, [product_variant_id, start_date, end_date])
                
                daily_performance = cursor.fetchall()
                
                # Query top customers
                cursor.execute(f"""
                    SELECT 
                        c.id as customer_id,
                        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
                        c.phone as customer_phone,
                        SUM(od.quantity) as total_quantity,
                        SUM(od.final_price) as total_spent,
                        COUNT(DISTINCT o.id) as total_orders
                    FROM orderdetail od
                    JOIN orders o ON od.order_id = o.id
                    JOIN customer c ON o.customer_id = c.id
                    WHERE od.product_variant_id = %s
                        AND o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        AND od.is_deleted = FALSE
                        {store_filter}
                    GROUP BY c.id, c.first_name, c.last_name, c.phone
                    ORDER BY total_spent DESC
                    LIMIT 10
                """, [product_variant_id, start_date, end_date])
                
                top_customers = cursor.fetchall()
                
                # Query thống kê trả hàng và bảo hành
                cursor.execute(f"""
                    SELECT 
                        COUNT(DISTINCT ro.id) as total_returns,
                        SUM(rod.quantity) as returned_quantity,
                        SUM(ro.refund_amount) as total_refund,
                        COUNT(DISTINCT w.id) as total_warranties,
                        COUNT(DISTINCT wc.id) as warranty_claims,
                        SUM(wc.repair_cost) as total_repair_cost
                    FROM orderdetail od
                    LEFT JOIN returnorderdetail rod ON od.id = rod.order_detail_id AND rod.is_deleted = FALSE
                    LEFT JOIN returnorder ro ON rod.return_order_id = ro.id AND ro.is_deleted = FALSE
                    LEFT JOIN warranty w ON od.id = w.order_detail_id AND w.is_deleted = FALSE
                    LEFT JOIN warrantyclaim wc ON w.id = wc.warranty_id AND wc.is_deleted = FALSE
                    WHERE od.product_variant_id = %s
                        AND od.is_deleted = FALSE
                """, [product_variant_id])
                
                return_warranty_stats = cursor.fetchone()
            
            # Xử lý dữ liệu sản phẩm
            product_data = {
                'product_variant_id': product_info[0],
                'sku': product_info[1],
                'product_name': product_info[2],
                'brand_name': product_info[3],
                'current_price': float(product_info[4] or 0),
                'current_stock': product_info[5] or 0,
                'is_active': product_info[6]
            }
            
            # Xử lý thống kê bán hàng
            if sales_stats:
                total_orders = sales_stats[0] or 0
                total_quantity = sales_stats[1] or 0
                total_revenue = sales_stats[2] or Decimal('0')
                total_discount = sales_stats[3] or Decimal('0')
                average_unit_price = sales_stats[4] or 0
                average_selling_price = sales_stats[5] or 0
                first_sale_date = sales_stats[6]
                last_sale_date = sales_stats[7]
                
                net_revenue = total_revenue - total_discount
                discount_rate = (total_discount / total_revenue * 100) if total_revenue and total_revenue > 0 else 0
                average_quantity_per_order = total_quantity / total_orders if total_orders and total_orders > 0 else 0
                average_revenue_per_order = float(total_revenue / total_orders) if total_orders and total_orders > 0 else 0
                
                # Tính tỷ lệ luân chuyển tồn kho
                current_stock = product_data['current_stock'] or 0
                turnover_rate = (total_quantity / current_stock * 100) if current_stock and current_stock > 0 else 0
                days_of_inventory = (current_stock / total_quantity * 365) if total_quantity and total_quantity > 0 else 0
            else:
                total_orders = total_quantity = 0
                total_revenue = total_discount = net_revenue = Decimal('0')
                average_unit_price = average_selling_price = discount_rate = 0
                average_quantity_per_order = average_revenue_per_order = 0
                turnover_rate = days_of_inventory = 0
                first_sale_date = last_sale_date = None
            
            # Xử lý dữ liệu theo ngày
            daily_data = []
            for row in daily_performance:
                daily_data.append({
                    'date': row[0].strftime('%Y-%m-%d'),
                    'quantity': row[1] or 0,
                    'revenue': float(row[2] or 0),
                    'orders': row[3] or 0
                })
            
            # Xử lý top customers
            customers_data = []
            for row in top_customers:
                customers_data.append({
                    'customer_id': row[0],
                    'customer_name': row[1] or '',
                    'customer_phone': row[2] or '',
                    'total_quantity': row[3] or 0,
                    'total_spent': float(row[4] or 0),
                    'total_orders': row[5] or 0
                })
            
            # Xử lý thống kê trả hàng và bảo hành
            if return_warranty_stats:
                returned_quantity = return_warranty_stats[1] or 0
                total_warranties = return_warranty_stats[3] or 0
                return_rate = (returned_quantity / total_quantity * 100) if total_quantity and total_quantity > 0 else 0
                warranty_rate = (total_warranties / total_quantity * 100) if total_quantity and total_quantity > 0 else 0
            else:
                return_rate = warranty_rate = 0
            
            return Response({
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'product_info': product_data,
                'sales_performance': {
                    'total_orders': total_orders,
                    'total_quantity_sold': total_quantity,
                    'total_revenue': float(total_revenue),
                    'total_discount': float(total_discount),
                    'net_revenue': float(net_revenue),
                    'average_unit_price': float(average_unit_price),
                    'average_selling_price': float(average_selling_price),
                    'discount_rate': float(discount_rate),
                    'average_quantity_per_order': float(average_quantity_per_order),
                    'average_revenue_per_order': float(average_revenue_per_order),
                    'first_sale_date': first_sale_date.strftime('%Y-%m-%d') if first_sale_date else None,
                    'last_sale_date': last_sale_date.strftime('%Y-%m-%d') if last_sale_date else None,
                    'turnover_rate': float(turnover_rate),
                    'days_of_inventory': int(days_of_inventory)
                },
                'return_warranty_analysis': {
                    'total_returns': return_warranty_stats[0] or 0,
                    'returned_quantity': returned_quantity,
                    'total_refund': float(return_warranty_stats[2] or 0),
                    'return_rate': float(return_rate),
                    'total_warranties': total_warranties,
                    'warranty_claims': return_warranty_stats[4] or 0,
                    'total_repair_cost': float(return_warranty_stats[5] or 0),
                    'warranty_rate': float(warranty_rate)
                },
                'daily_performance': daily_data,
                'top_customers': customers_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 