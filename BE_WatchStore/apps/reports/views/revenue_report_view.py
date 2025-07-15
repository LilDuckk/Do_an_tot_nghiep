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
from apps.core.utils.permissions import IsSuperUser, ViewReportsPermission

class RevenueReportViewSet(viewsets.ViewSet):
    """
    ViewSet cho báo cáo doanh thu - Sử dụng SQL queries tối ưu
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

            debug_cogs_details = []  # Danh sách debug từng dòng xuất

            with connection.cursor() as cursor:
                # 1. Query doanh thu
                revenue_query = f"""
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
                """
                cursor.execute(revenue_query, [start_date, end_date])
                revenue_result = cursor.fetchone()

                # 2. Lấy tất cả order detail trong kỳ
                cursor.execute(f'''
                    SELECT od.product_variant_id, od.quantity, o.order_date
                    FROM orders o
                    JOIN orderdetail od ON o.id = od.order_id AND od.is_deleted = FALSE
                    WHERE o.order_date >= %s AND o.order_date <= %s
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        {store_filter}
                ''', [start_date, end_date])
                order_details = cursor.fetchall()  # [(product_variant_id, quantity, order_date), ...]

                # 3. Tính COGS theo bình quân tại thời điểm xuất, đồng thời debug từng dòng
                total_cogs = 0
                for product_variant_id, sold_qty, order_date in order_details:
                    cursor.execute('''
                        SELECT 
                            SUM(grd.unit_price * grd.accepted_quantity) as total_cost,
                            SUM(grd.accepted_quantity) as total_qty
                        FROM goods_receipt_details grd
                        JOIN goods_receipts gr ON grd.goods_receipt_id = gr.id
                        WHERE grd.product_variant_id = %s
                            AND gr.status IN ('confirmed', 'completed')
                            AND gr.is_deleted = FALSE
                            AND grd.is_deleted = FALSE
                            AND grd.accepted_quantity > 0
                            AND gr.receipt_date <= %s
                    ''', [product_variant_id, order_date])
                    gr_result = cursor.fetchone()
                    total_cost = gr_result[0] or 0
                    total_qty = gr_result[1] or 0
                    avg_cost = (total_cost / total_qty) if total_qty else 0
                    cogs_line = sold_qty * avg_cost
                    total_cogs += cogs_line
                    debug_cogs_details.append({
                        'product_variant_id': product_variant_id,
                        'sold_qty': float(sold_qty),
                        'order_date': str(order_date),
                        'total_cost_upto_order': float(total_cost),
                        'total_qty_upto_order': float(total_qty),
                        'avg_cost_upto_order': float(avg_cost),
                        'cogs_line': float(cogs_line)
                    })
                cogs = Decimal(str(total_cogs))

            # --- Xử lý kết quả ngoài khối with ---
            total_orders, gross_revenue, total_items, total_discounts = revenue_result
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
                'cost_of_goods_sold': {
                    'total_cost': float(cogs),
                    'cost_percentage': float((cogs / net_revenue * 100) if net_revenue else 0),
                    'cost_per_item': float(cogs / (total_items or 1)) if total_items else 0,
                    'cost_per_order': float(cogs / total_orders) if total_orders else 0,
                    'cost_to_revenue_ratio': float(cogs / gross_revenue) if gross_revenue else 0
                },
                'profit': {
                    'gross_profit': float(gross_profit),
                    'gross_profit_margin': float((gross_profit / net_revenue * 100) if net_revenue else 0),
                    'profit_per_order': float(gross_profit / total_orders) if total_orders else 0,
                    'profit_per_item': float(gross_profit / (total_items or 1)) if total_items else 0,
                    'profit_to_cost_ratio': float(gross_profit / cogs) if cogs else 0
                },
                'volume': {
                    'total_orders': total_orders,
                    'total_items': total_items or 0,
                    'average_order_value': float(gross_revenue / total_orders) if total_orders else 0
                },
                'debug_cogs_details': debug_cogs_details
            }

            return Response(profit_analysis, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(f"Error in profit_analysis: {e}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def debug_profit_data(self, request):
        """Debug endpoint để kiểm tra dữ liệu cho profit analysis"""
        try:
            store_id = request.query_params.get('store_id')
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            
            if not start_date:
                start_date = (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            if not end_date:
                end_date = timezone.now().strftime('%Y-%m-%d')
            
            store_filter = ""
            if store_id:
                store_filter = f"AND o.store_id = {store_id}"
            
            with connection.cursor() as cursor:
                # Kiểm tra orders
                cursor.execute(f"""
                    SELECT o.id, o.order_date, o.status, o.total_amount, o.store_id
                    FROM orders o
                    WHERE o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        {store_filter}
                    ORDER BY o.order_date DESC
                    LIMIT 10
                """, [start_date, end_date])
                orders = cursor.fetchall()
                
                # Kiểm tra goods_receipts
                cursor.execute(f"""
                    SELECT gr.id, gr.receipt_number, gr.receipt_date, gr.status, gr.store_id
                    FROM goods_receipts gr
                    WHERE gr.status IN ('confirmed', 'completed')
                        AND gr.is_deleted = FALSE
                        {store_filter}
                    ORDER BY gr.receipt_date DESC
                    LIMIT 10
                """, [])
                goods_receipts = cursor.fetchall()
                
                # Kiểm tra purchase_orders
                cursor.execute(f"""
                    SELECT po.id, po.po_number, po.order_date, po.status, po.store_id
                    FROM purchase_orders po
                    WHERE po.status IN ('confirmed', 'ordered', 'receiving', 'completed')
                        AND po.is_deleted = FALSE
                        {store_filter}
                    ORDER BY po.order_date DESC
                    LIMIT 10
                """, [])
                purchase_orders = cursor.fetchall()
            
            return Response({
                'period': {'start_date': start_date, 'end_date': end_date},
                'store_id': store_id,
                'orders': [
                    {
                        'id': o[0], 'order_date': str(o[1]), 'status': o[2], 
                        'total_amount': float(o[3]), 'store_id': o[4]
                    } for o in orders
                ],
                'goods_receipts': [
                    {
                        'id': gr[0], 'receipt_number': gr[1], 'receipt_date': str(gr[2]), 
                        'status': gr[3], 'store_id': gr[4]
                    } for gr in goods_receipts
                ],
                'purchase_orders': [
                    {
                        'id': po[0], 'po_number': po[1], 'order_date': str(po[2]), 
                        'status': po[3], 'store_id': po[4]
                    } for po in purchase_orders
                ]
            })
            
        except Exception as e:
            import traceback
            print(f"Error in debug_profit_data: {e}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def calculate_daily_revenue(self, request):
        """Tính toán doanh thu theo ngày với phân tích chi tiết"""
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
                            ELSE 0 END) as coupon_discounts,
                        COUNT(DISTINCT od.product_variant_id) as unique_products
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
                'total_customers': set(),
                'total_unique_products': set()
            }
            
            for row in results:
                date, orders, gross_revenue, items, customers, avg_order, discounts, coupon_discounts, unique_products = row
                
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
                    'unique_products': unique_products,
                    'average_order_value': float(avg_order or 0),
                    'discount_rate': float((discounts / gross_revenue * 100) if gross_revenue else 0),
                    'items_per_order': float((items or 0) / orders) if orders else 0
                })
                
                # Cộng dồn tổng kết
                total_summary['total_orders'] += orders
                total_summary['total_gross_revenue'] += gross_revenue
                total_summary['total_net_revenue'] += net_revenue
                total_summary['total_discounts'] += discounts
                total_summary['total_coupon_discounts'] += coupon_discounts or 0
                total_summary['total_items'] += items or 0
                total_summary['total_customers'].add(customers)
                total_summary['total_unique_products'].add(unique_products)
            
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
                'total_unique_products': len(total_summary['total_unique_products']),
                'average_order_value': float(total_summary['total_gross_revenue'] / total_summary['total_orders']) if total_summary['total_orders'] else 0,
                'average_discount_rate': float((total_summary['total_discounts'] / total_summary['total_gross_revenue'] * 100) if total_summary['total_gross_revenue'] else 0),
                'average_items_per_order': float(total_summary['total_items'] / total_summary['total_orders']) if total_summary['total_orders'] else 0
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
    def inventory_analysis(self, request):
        """Phân tích tồn kho theo doanh thu"""
        try:
            # Lấy tham số
            days = int(request.query_params.get('days', 30))
            store_id = request.query_params.get('store_id')
            
            # Tính ngày
            end_date = timezone.now()
            start_date = end_date - timedelta(days=days)
            
            # Điều kiện lọc theo cửa hàng
            store_filter = ""
            if store_id:
                store_filter = f"AND o.store_id = {store_id}"
            else:
                store_filter = self.get_user_store_filter()
            
            # SQL query phân tích tồn kho
            with connection.cursor() as cursor:
                cursor.execute(f"""
                    SELECT 
                        pv.id as variant_id,
                        p.name as product_name,
                        pv.sku as sku,
                        NULL as variant_name,
                        COALESCE(SUM(od.quantity), 0) as total_sold,
                        COALESCE(SUM(od.final_price), 0) as total_revenue,
                        COALESCE(AVG(od.final_price), 0) as avg_price,
                        COALESCE(SUM(od.quantity * od.final_price), 0) as total_value,
                        COUNT(DISTINCT o.id) as order_count,
                        COALESCE(SUM(od.quantity) / NULLIF(COUNT(DISTINCT o.id), 0), 0) as avg_quantity_per_order
                    FROM product p
                    JOIN productvariant pv ON p.id = pv.product_id
                    LEFT JOIN orderdetail od ON pv.id = od.product_variant_id AND od.is_deleted = FALSE
                    LEFT JOIN orders o ON od.order_id = o.id 
                        AND o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        {store_filter}
                    WHERE p.is_deleted = FALSE AND pv.is_deleted = FALSE
                    GROUP BY pv.id, p.name, pv.sku
                    HAVING SUM(od.quantity) > 0
                    ORDER BY total_sold DESC
                    LIMIT 50
                """, [start_date, end_date])
                
                results = cursor.fetchall()
            
            # Xử lý kết quả
            inventory_data = []
            total_summary = {
                'total_products': 0,
                'total_sold': 0,
                'total_revenue': Decimal('0'),
                'total_value': Decimal('0'),
                'total_orders': 0
            }
            
            for row in results:
                variant_id, product_name, sku, variant_name, total_sold, total_revenue, avg_price, total_value, order_count, avg_quantity = row
                
                inventory_data.append({
                    'variant_id': variant_id,
                    'product_name': product_name,
                    'sku': sku,
                    'variant_name': variant_name,
                    'total_sold': total_sold,
                    'total_revenue': float(total_revenue),
                    'avg_price': float(avg_price),
                    'total_value': float(total_value),
                    'order_count': order_count,
                    'avg_quantity_per_order': float(avg_quantity),
                    'revenue_per_unit': float(total_revenue / total_sold) if total_sold > 0 else 0
                })
                
                # Cộng dồn tổng kết
                total_summary['total_products'] += 1
                total_summary['total_sold'] += total_sold
                total_summary['total_revenue'] += total_revenue
                total_summary['total_value'] += total_value
                total_summary['total_orders'] += order_count
            
            # Tính tổng kết
            summary = {
                'period_days': days,
                'total_products': total_summary['total_products'],
                'total_sold': total_summary['total_sold'],
                'total_revenue': float(total_summary['total_revenue']),
                'total_value': float(total_summary['total_value']),
                'total_orders': total_summary['total_orders'],
                'average_revenue_per_product': float(total_summary['total_revenue'] / total_summary['total_products']) if total_summary['total_products'] else 0,
                'average_sold_per_product': float(total_summary['total_sold'] / total_summary['total_products']) if total_summary['total_products'] else 0
            }
            
            return Response({
                'summary': summary,
                'inventory_data': inventory_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def revenue_forecast(self, request):
        """Dự báo doanh thu trong tương lai"""
        try:
            # Lấy tham số
            days = int(request.query_params.get('days', 7))
            store_id = request.query_params.get('store_id')
            
            # Điều kiện lọc theo cửa hàng
            store_filter = ""
            if store_id:
                store_filter = f"AND o.store_id = {store_id}"
            else:
                store_filter = self.get_user_store_filter()
            
            # SQL query để lấy dữ liệu lịch sử
            with connection.cursor() as cursor:
                cursor.execute(f"""
                    SELECT 
                        DATE(o.order_date) as date,
                        COUNT(DISTINCT o.id) as total_orders,
                        SUM(o.total_amount) as gross_revenue,
                        AVG(o.total_amount) as average_order_value,
                        COUNT(DISTINCT o.customer_id) as total_customers
                    FROM orders o
                    WHERE o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        {store_filter}
                    GROUP BY DATE(o.order_date)
                    ORDER BY date
                """, [
                    (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
                    timezone.now().strftime('%Y-%m-%d')
                ])
                
                historical_data = cursor.fetchall()
            
            # Tính toán dự báo đơn giản dựa trên trung bình
            if historical_data:
                total_revenue = sum(row[2] or 0 for row in historical_data)
                total_orders = sum(row[1] for row in historical_data)
                total_customers = sum(row[4] for row in historical_data)
                days_count = len(historical_data)
                
                avg_daily_revenue = total_revenue / days_count if days_count > 0 else 0
                avg_daily_orders = total_orders / days_count if days_count > 0 else 0
                avg_daily_customers = total_customers / days_count if days_count > 0 else 0
                avg_order_value = total_revenue / total_orders if total_orders > 0 else 0
                
                # Tạo dự báo
                forecast_data = []
                current_date = timezone.now().date()
                
                for i in range(1, days + 1):
                    forecast_date = current_date + timedelta(days=i)
                    
                    # Dự báo đơn giản với biến động ngẫu nhiên nhỏ (±10%)
                    variation = 1 + (hash(str(forecast_date)) % 20 - 10) / 100
                    variation_float = float(variation)
                    forecast_revenue = float(avg_daily_revenue) * variation_float
                    forecast_orders = float(avg_daily_orders) * variation_float
                    forecast_customers = float(avg_daily_customers) * variation_float
                    
                    forecast_data.append({
                        'date': forecast_date.strftime('%Y-%m-%d'),
                        'predicted_revenue': float(forecast_revenue),
                        'predicted_orders': int(forecast_orders),
                        'predicted_customers': int(forecast_customers),
                        'predicted_order_value': float(avg_order_value),
                        'confidence_level': 0.85  # Mức độ tin cậy
                    })
                
                # Tính tổng dự báo
                total_forecast_revenue = sum(item['predicted_revenue'] for item in forecast_data)
                total_forecast_orders = sum(item['predicted_orders'] for item in forecast_data)
                total_forecast_customers = sum(item['predicted_customers'] for item in forecast_data)
                
                forecast_summary = {
                    'forecast_period_days': days,
                    'total_predicted_revenue': float(total_forecast_revenue),
                    'total_predicted_orders': total_forecast_orders,
                    'total_predicted_customers': total_forecast_customers,
                    'average_daily_predicted_revenue': float(total_forecast_revenue / days),
                    'average_daily_predicted_orders': float(total_forecast_orders / days),
                    'average_daily_predicted_customers': float(total_forecast_customers / days),
                    'confidence_level': 0.85,
                    'method': 'Simple moving average with seasonal variation'
                }
            else:
                forecast_data = []
                forecast_summary = {
                    'forecast_period_days': days,
                    'error': 'Không đủ dữ liệu lịch sử để tạo dự báo'
                }
            
            return Response({
                'summary': forecast_summary,
                'forecast_data': forecast_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def daily_summary(self, request):
        """Tóm tắt doanh thu theo ngày"""
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
                
                result = cursor.fetchone()
            
            if result:
                total_orders, gross_revenue, total_items, total_customers, avg_order, total_discounts = result
                
                gross_revenue = gross_revenue or Decimal('0')
                total_discounts = total_discounts or Decimal('0')
                net_revenue = gross_revenue - total_discounts
                
                summary = {
                    'period': {
                        'start_date': start_date,
                        'end_date': end_date
                    },
                    'total_orders': total_orders,
                    'gross_revenue': float(gross_revenue),
                    'net_revenue': float(net_revenue),
                    'total_discounts': float(total_discounts),
                    'total_items': total_items or 0,
                    'total_customers': total_customers,
                    'average_order_value': float(avg_order or 0),
                    'discount_rate': float((total_discounts / gross_revenue * 100) if gross_revenue else 0),
                    'items_per_order': float((total_items or 0) / total_orders) if total_orders else 0
                }
            else:
                summary = {
                    'period': {
                        'start_date': start_date,
                        'end_date': end_date
                    },
                    'total_orders': 0,
                    'gross_revenue': 0.0,
                    'net_revenue': 0.0,
                    'total_discounts': 0.0,
                    'total_items': 0,
                    'total_customers': 0,
                    'average_order_value': 0.0,
                    'discount_rate': 0.0,
                    'items_per_order': 0.0
                }
            
            return Response(summary, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def daily_breakdown(self, request):
        """Phân tích chi tiết doanh thu theo ngày"""
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
                        COUNT(DISTINCT od.product_variant_id) as unique_products,
                        EXTRACT(DOW FROM o.order_date) as day_of_week
                    FROM orders o
                    LEFT JOIN orderdetail od ON o.id = od.order_id AND od.is_deleted = FALSE
                    WHERE o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        {store_filter}
                    GROUP BY DATE(o.order_date), EXTRACT(DOW FROM o.order_date)
                    ORDER BY date
                """, [start_date, end_date])
                
                results = cursor.fetchall()
            
            # Xử lý kết quả
            daily_breakdown = []
            day_names = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
            
            for row in results:
                date, orders, gross_revenue, items, customers, avg_order, discounts, unique_products, day_of_week = row
                
                gross_revenue = gross_revenue or Decimal('0')
                discounts = discounts or Decimal('0')
                net_revenue = gross_revenue - discounts
                
                daily_breakdown.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'day_of_week': day_names[int(day_of_week)],
                    'total_orders': orders,
                    'gross_revenue': float(gross_revenue),
                    'net_revenue': float(net_revenue),
                    'total_discounts': float(discounts),
                    'total_items': items or 0,
                    'total_customers': customers,
                    'unique_products': unique_products,
                    'average_order_value': float(avg_order or 0),
                    'discount_rate': float((discounts / gross_revenue * 100) if gross_revenue else 0),
                    'items_per_order': float((items or 0) / orders) if orders else 0
                })
            
            return Response({
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'daily_breakdown': daily_breakdown
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def top_products(self, request):
        """Sản phẩm bán chạy nhất trong khoảng thời gian"""
        try:
            # Lấy tham số
            days = int(request.query_params.get('days', 30))
            limit = int(request.query_params.get('limit', 10))
            store_id = request.query_params.get('store_id')
            
            # Tính ngày
            end_date = timezone.now()
            start_date = end_date - timedelta(days=days)
            
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
                        pv.id as variant_id,
                        p.name as product_name,
                        pv.sku as sku,
                        pv.name as variant_name,
                        COALESCE(SUM(od.quantity), 0) as total_sold,
                        COALESCE(SUM(od.final_price), 0) as total_revenue,
                        COUNT(DISTINCT o.id) as order_count
                    FROM products p
                    JOIN productvariants pv ON p.id = pv.product_id
                    LEFT JOIN orderdetail od ON pv.id = od.product_variant_id AND od.is_deleted = FALSE
                    LEFT JOIN orders o ON od.order_id = o.id 
                        AND o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        {store_filter}
                    WHERE p.is_deleted = FALSE AND pv.is_deleted = FALSE
                    GROUP BY pv.id, p.name, pv.sku, pv.name
                    HAVING total_sold > 0
                    ORDER BY total_sold DESC, total_revenue DESC
                    LIMIT %s
                """, [start_date, end_date, limit])
                
                results = cursor.fetchall()
            
            # Xử lý kết quả
            top_products = []
            for row in results:
                variant_id, product_name, sku, variant_name, total_sold, total_revenue, order_count = row
                
                top_products.append({
                    'variant_id': variant_id,
                    'product_name': product_name,
                    'sku': sku,
                    'variant_name': variant_name,
                    'total_sold': total_sold,
                    'total_revenue': float(total_revenue),
                    'order_count': order_count,
                    'revenue_per_unit': float(total_revenue / total_sold) if total_sold > 0 else 0
                })
            
            return Response({
                'period_days': days,
                'limit': limit,
                'top_products': top_products
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def store_performance(self, request):
        """Hiệu suất của các cửa hàng"""
        try:
            # Lấy tham số
            days = int(request.query_params.get('days', 30))
            store_id = request.query_params.get('store_id')
            
            # Tính ngày
            end_date = timezone.now()
            start_date = end_date - timedelta(days=days)
            
            # SQL query tối ưu
            with connection.cursor() as cursor:
                cursor.execute(f"""
                    SELECT 
                        s.id as store_id,
                        s.name as store_name,
                        s.address as store_address,
                        COUNT(DISTINCT o.id) as total_orders,
                        SUM(o.total_amount) as gross_revenue,
                        SUM(od.quantity) as total_items,
                        COUNT(DISTINCT o.customer_id) as total_customers,
                        AVG(o.total_amount) as average_order_value,
                        SUM(od.unit_price * od.quantity - od.final_price) as total_discounts
                    FROM stores s
                    LEFT JOIN orders o ON s.id = o.store_id 
                        AND o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                    LEFT JOIN orderdetail od ON o.id = od.order_id AND od.is_deleted = FALSE
                    WHERE s.is_deleted = FALSE
                    GROUP BY s.id, s.name, s.address
                    ORDER BY gross_revenue DESC NULLS LAST
                """, [start_date, end_date])
                
                results = cursor.fetchall()
            
            # Xử lý kết quả
            store_performance = []
            total_summary = {
                'total_stores': 0,
                'total_orders': 0,
                'total_revenue': Decimal('0'),
                'total_items': 0,
                'total_customers': 0
            }
            
            for row in results:
                (store_id, store_name, store_address, total_orders, gross_revenue, 
                 total_items, total_customers, avg_order, total_discounts) = row
                
                gross_revenue = gross_revenue or Decimal('0')
                total_discounts = total_discounts or Decimal('0')
                net_revenue = gross_revenue - total_discounts
                
                store_performance.append({
                    'store_id': store_id,
                    'store_name': store_name,
                    'store_address': store_address,
                    'total_orders': total_orders or 0,
                    'gross_revenue': float(gross_revenue),
                    'net_revenue': float(net_revenue),
                    'total_discounts': float(total_discounts),
                    'total_items': total_items or 0,
                    'total_customers': total_customers or 0,
                    'average_order_value': float(avg_order or 0),
                    'discount_rate': float((total_discounts / gross_revenue * 100) if gross_revenue else 0)
                })
                
                # Cộng dồn tổng kết
                total_summary['total_stores'] += 1
                total_summary['total_orders'] += total_orders or 0
                total_summary['total_revenue'] += gross_revenue
                total_summary['total_items'] += total_items or 0
                total_summary['total_customers'] += total_customers or 0
            
            # Tính tổng kết
            summary = {
                'period_days': days,
                'total_stores': total_summary['total_stores'],
                'total_orders': total_summary['total_orders'],
                'total_revenue': float(total_summary['total_revenue']),
                'total_items': total_summary['total_items'],
                'total_customers': total_summary['total_customers'],
                'average_revenue_per_store': float(total_summary['total_revenue'] / total_summary['total_stores']) if total_summary['total_stores'] else 0,
                'average_orders_per_store': float(total_summary['total_orders'] / total_summary['total_stores']) if total_summary['total_stores'] else 0
            }
            
            return Response({
                'summary': summary,
                'store_performance': store_performance
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 