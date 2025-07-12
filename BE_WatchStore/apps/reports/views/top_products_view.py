from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import OR
from django.db import connection
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from apps.core.utils.permissions import IsSuperUser, ViewReportsPermission
from apps.stores.models.employee import Employee

class TopProductsView(APIView):
    """
    API để lấy danh sách sản phẩm bán chạy nhất
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

    def get(self, request):
        """Lấy danh sách sản phẩm bán chạy nhất"""
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
                        p.id as product_id,
                        p.name as product_name,
                        pv.sku as sku,
                        NULL as variant_name,
                        b.name as brand_name,
                        c.name as category_name,
                        COALESCE(SUM(od.quantity), 0) as total_sold,
                        COALESCE(SUM(od.final_price), 0) as total_revenue,
                        COALESCE(AVG(od.final_price), 0) as avg_price,
                        COUNT(DISTINCT o.id) as order_count,
                        COALESCE(SUM(od.quantity) / NULLIF(COUNT(DISTINCT o.id), 0), 0) as avg_quantity_per_order,
                        COALESCE(SUM(od.final_price) / NULLIF(SUM(od.quantity), 0), 0) as revenue_per_unit
                    FROM product p
                    JOIN productvariant pv ON p.id = pv.product_id
                    LEFT JOIN brand b ON p.brand_id = b.id
                    LEFT JOIN category c ON p.category_id = c.id
                    LEFT JOIN orderdetail od ON pv.id = od.product_variant_id AND od.is_deleted = FALSE
                    LEFT JOIN orders o ON od.order_id = o.id 
                        AND o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        {store_filter}
                    WHERE p.is_deleted = FALSE AND pv.is_deleted = FALSE
                    GROUP BY pv.id, p.id, p.name, pv.sku, b.name, c.name
                    HAVING SUM(od.quantity) > 0
                    ORDER BY total_sold DESC, total_revenue DESC
                    LIMIT %s
                """, [start_date, end_date, limit])
                
                results = cursor.fetchall()
            
            # Xử lý kết quả
            top_products = []
            total_summary = {
                'total_products': 0,
                'total_sold': 0,
                'total_revenue': Decimal('0'),
                'total_orders': 0
            }
            
            for row in results:
                (variant_id, product_id, product_name, sku, variant_name, 
                 brand_name, category_name, total_sold, total_revenue, avg_price, 
                 order_count, avg_quantity, revenue_per_unit) = row
                
                top_products.append({
                    'variant_id': variant_id,
                    'product_id': product_id,
                    'product_name': product_name,
                    'sku': sku,
                    'variant_name': variant_name,
                    'brand_name': brand_name,
                    'category_name': category_name,
                    'total_sold': total_sold,
                    'total_revenue': float(total_revenue),
                    'avg_price': float(avg_price),
                    'order_count': order_count,
                    'avg_quantity_per_order': float(avg_quantity),
                    'revenue_per_unit': float(revenue_per_unit),
                    'performance_score': float(total_sold * total_revenue)  # Điểm hiệu suất
                })
                
                # Cộng dồn tổng kết
                total_summary['total_products'] += 1
                total_summary['total_sold'] += total_sold
                total_summary['total_revenue'] += total_revenue
                total_summary['total_orders'] += order_count
            
            # Tính tổng kết
            summary = {
                'period_days': days,
                'limit': limit,
                'total_products': total_summary['total_products'],
                'total_sold': total_summary['total_sold'],
                'total_revenue': float(total_summary['total_revenue']),
                'total_orders': total_summary['total_orders'],
                'average_revenue_per_product': float(total_summary['total_revenue'] / total_summary['total_products']) if total_summary['total_products'] else 0,
                'average_sold_per_product': float(total_summary['total_sold'] / total_summary['total_products']) if total_summary['total_products'] else 0
            }
            
            return Response({
                'summary': summary,
                'top_products': top_products
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 