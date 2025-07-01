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
from apps.inventory.models.inventory_transaction import InventoryTransaction
from apps.purchases.models.goods_receipt import GoodsReceipt
from apps.purchases.models.goods_receipt_detail import GoodsReceiptDetail
from apps.stores.models.store import Store
from apps.stores.models.employee import Employee
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee

class RevenueReportViewSet(viewsets.ViewSet):
    """
    ViewSet cho báo cáo doanh thu - Sử dụng SQL queries tối ưu
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
    def daily_revenue(self, request):
        """Báo cáo doanh thu theo ngày - SQL tối ưu"""
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
            
            # SQL query tối ưu
            with connection.cursor() as cursor:
                cursor.execute(f"""
                    SELECT 
                        DATE(o.order_date) as date,
                        COUNT(DISTINCT o.id) as total_orders,
                        SUM(o.total_amount) as gross_revenue,
                        SUM(od.quantity) as total_items,
                        COUNT(DISTINCT o.customer_id) as total_customers,
                        AVG(o.total_amount) as average_order_value,
                        SUM(od.unit_price * od.quantity - od.final_price) as total_discounts,
                        SUM(CASE WHEN od.coupon_id IS NOT NULL 
                            THEN od.unit_price * od.quantity - od.final_price 
                            ELSE 0 END) as coupon_discounts
                    FROM orders o
                    LEFT JOIN orderdetail od ON o.id = od.order_id AND od.is_deleted = FALSE
                    WHERE o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        {store_filter}
                    GROUP BY DATE(o.order_date)
                    ORDER BY date
                """, [start_date, end_date])
                
                results = cursor.fetchall()
            
            # Xử lý kết quả
            daily_data = []
            total_summary = {
                'total_orders': 0,
                'total_gross_revenue': Decimal('0'),
                'total_net_revenue': Decimal('0'),
                'total_discounts': Decimal('0'),
                'total_coupon_discounts': Decimal('0'),
                'total_items': 0,
                'total_customers': set()
            }
            
            for row in results:
                date, orders, gross_revenue, items, customers, avg_order, discounts, coupon_discounts = row
                
                gross_revenue = gross_revenue or Decimal('0')
                discounts = discounts or Decimal('0')
                net_revenue = gross_revenue - discounts
                
                daily_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'total_orders': orders,
                    'gross_revenue': float(gross_revenue),
                    'net_revenue': float(net_revenue),
                    'total_discounts': float(discounts),
                    'coupon_discounts': float(coupon_discounts or 0),
                    'total_items': items or 0,
                    'total_customers': customers,
                    'average_order_value': float(avg_order or 0),
                    'discount_rate': float((discounts / gross_revenue * 100) if gross_revenue else 0)
                })
                
                # Cộng dồn tổng kết
                total_summary['total_orders'] += orders
                total_summary['total_gross_revenue'] += gross_revenue
                total_summary['total_net_revenue'] += net_revenue
                total_summary['total_discounts'] += discounts
                total_summary['total_coupon_discounts'] += coupon_discounts or 0
                total_summary['total_items'] += items or 0
                total_summary['total_customers'].add(customers)
            
            # Tính tổng kết
            summary = {
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'total_orders': total_summary['total_orders'],
                'total_gross_revenue': float(total_summary['total_gross_revenue']),
                'total_net_revenue': float(total_summary['total_net_revenue']),
                'total_discounts': float(total_summary['total_discounts']),
                'total_coupon_discounts': float(total_summary['total_coupon_discounts']),
                'total_items': total_summary['total_items'],
                'total_customers': len(total_summary['total_customers']),
                'average_order_value': float(total_summary['total_gross_revenue'] / total_summary['total_orders']) if total_summary['total_orders'] else 0,
                'average_discount_rate': float((total_summary['total_discounts'] / total_summary['total_gross_revenue'] * 100) if total_summary['total_gross_revenue'] else 0)
            }
            
            return Response({
                'summary': summary,
                'daily_data': daily_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def monthly_revenue(self, request):
        """Báo cáo doanh thu theo tháng - SQL tối ưu"""
        try:
            # Lấy tham số
            year = request.query_params.get('year', timezone.now().year)
            store_id = request.query_params.get('store_id')
            
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
                        EXTRACT(MONTH FROM o.order_date) as month,
                        COUNT(DISTINCT o.id) as total_orders,
                        SUM(o.total_amount) as gross_revenue,
                        SUM(od.quantity) as total_items,
                        COUNT(DISTINCT o.customer_id) as total_customers,
                        AVG(o.total_amount) as average_order_value,
                        SUM(od.unit_price * od.quantity - od.final_price) as total_discounts,
                        SUM(CASE WHEN od.coupon_id IS NOT NULL 
                            THEN od.unit_price * od.quantity - od.final_price 
                            ELSE 0 END) as coupon_discounts
                    FROM orders o
                    LEFT JOIN orderdetail od ON o.id = od.order_id AND od.is_deleted = FALSE
                    WHERE EXTRACT(YEAR FROM o.order_date) = %s
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        {store_filter}
                    GROUP BY EXTRACT(MONTH FROM o.order_date)
                    ORDER BY month
                """, [year])
                
                results = cursor.fetchall()
            
            # Xử lý kết quả
            monthly_data = []
            total_summary = {
                'total_orders': 0,
                'total_gross_revenue': Decimal('0'),
                'total_net_revenue': Decimal('0'),
                'total_discounts': Decimal('0'),
                'total_coupon_discounts': Decimal('0'),
                'total_items': 0,
                'total_customers': set()
            }
            
            for row in results:
                month, orders, gross_revenue, items, customers, avg_order, discounts, coupon_discounts = row
                
                gross_revenue = gross_revenue or Decimal('0')
                discounts = discounts or Decimal('0')
                net_revenue = gross_revenue - discounts
                
                monthly_data.append({
                    'month': int(month),
                    'month_name': datetime(year, int(month), 1).strftime('%B'),
                    'total_orders': orders,
                    'gross_revenue': float(gross_revenue),
                    'net_revenue': float(net_revenue),
                    'total_discounts': float(discounts),
                    'coupon_discounts': float(coupon_discounts or 0),
                    'total_items': items or 0,
                    'total_customers': customers,
                    'average_order_value': float(avg_order or 0),
                    'discount_rate': float((discounts / gross_revenue * 100) if gross_revenue else 0)
                })
                
                # Cộng dồn tổng kết
                total_summary['total_orders'] += orders
                total_summary['total_gross_revenue'] += gross_revenue
                total_summary['total_net_revenue'] += net_revenue
                total_summary['total_discounts'] += discounts
                total_summary['total_coupon_discounts'] += coupon_discounts or 0
                total_summary['total_items'] += items or 0
                total_summary['total_customers'].add(customers)
            
            # Tính tổng kết
            summary = {
                'year': year,
                'total_orders': total_summary['total_orders'],
                'total_gross_revenue': float(total_summary['total_gross_revenue']),
                'total_net_revenue': float(total_summary['total_net_revenue']),
                'total_discounts': float(total_summary['total_discounts']),
                'total_coupon_discounts': float(total_summary['total_coupon_discounts']),
                'total_items': total_summary['total_items'],
                'total_customers': len(total_summary['total_customers']),
                'average_order_value': float(total_summary['total_gross_revenue'] / total_summary['total_orders']) if total_summary['total_orders'] else 0,
                'average_discount_rate': float((total_summary['total_discounts'] / total_summary['total_gross_revenue'] * 100) if total_summary['total_gross_revenue'] else 0)
            }
            
            return Response({
                'summary': summary,
                'monthly_data': monthly_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def profit_analysis(self, request):
        """Phân tích lãi gộp - SQL tối ưu"""
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
            
            # SQL query tối ưu cho doanh thu và chi phí
            with connection.cursor() as cursor:
                # Query doanh thu
                cursor.execute(f"""
                    SELECT 
                        COUNT(DISTINCT o.id) as total_orders,
                        SUM(o.total_amount) as gross_revenue,
                        SUM(od.quantity) as total_items,
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
                
                # Query chi phí hàng bán (COGS) - tính từ giá nhập kho
                cursor.execute(f"""
                    SELECT 
                        SUM(od.quantity * COALESCE(
                            (SELECT AVG(grd.unit_price) 
                             FROM goods_receipt_details grd 
                             JOIN goods_receipts gr ON grd.goods_receipt_id = gr.id
                             WHERE grd.product_variant_id = od.product_variant_id 
                               AND gr.status = 'confirmed'
                               AND gr.is_deleted = FALSE
                               AND gr.receipt_date <= o.order_date
                             LIMIT 1), 0
                        )) as cost_of_goods_sold
                    FROM orders o
                    JOIN orderdetail od ON o.id = od.order_id AND od.is_deleted = FALSE
                    WHERE o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        {store_filter}
                """, [start_date, end_date])
                
                cogs_result = cursor.fetchone()
            
            # Xử lý kết quả
            total_orders, gross_revenue, total_items, total_discounts = revenue_result
            cogs = cogs_result[0] if cogs_result[0] else Decimal('0')
            
            gross_revenue = gross_revenue or Decimal('0')
            total_discounts = total_discounts or Decimal('0')
            net_revenue = gross_revenue - total_discounts
            gross_profit = net_revenue - cogs
            
            profit_analysis = {
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'revenue': {
                    'gross_revenue': float(gross_revenue),
                    'total_discounts': float(total_discounts),
                    'net_revenue': float(net_revenue),
                    'discount_rate': float((total_discounts / gross_revenue * 100) if gross_revenue else 0)
                },
                'costs': {
                    'cost_of_goods_sold': float(cogs),
                    'cost_percentage': float((cogs / net_revenue * 100) if net_revenue else 0)
                },
                'profit': {
                    'gross_profit': float(gross_profit),
                    'gross_profit_margin': float((gross_profit / net_revenue * 100) if net_revenue else 0),
                    'profit_per_order': float(gross_profit / total_orders) if total_orders else 0
                },
                'volume': {
                    'total_orders': total_orders,
                    'total_items': total_items or 0,
                    'average_order_value': float(gross_revenue / total_orders) if total_orders else 0
                }
            }
            
            return Response(profit_analysis, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 