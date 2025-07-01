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
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee

class SalesAnalysisViewSet(viewsets.ViewSet):
    """
    ViewSet cho phân tích bán hàng - Sử dụng SQL queries tối ưu
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
    def product_performance(self, request):
        """Hiệu suất sản phẩm theo thời gian - SQL tối ưu"""
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