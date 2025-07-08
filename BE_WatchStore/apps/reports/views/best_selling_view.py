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
from apps.reports.serializers.best_selling_serializer import BestSellingSerializer

class BestSellingView(APIView):
    

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.request.method == 'GET':
            # Cho phép user đã đăng nhập xem báo cáo sản phẩm bán chạy
            return [OR(IsSuperUser(), ViewReportsPermission() )]
        return super().get_permissions()

    def get(self, request):
        try:
            limit = int(request.query_params.get('limit', 10))
            
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        p.id as product_id,
                        p.name as product_name,
                        COALESCE(b.name, '') as brand_name,
                        COALESCE(c.name, '') as category_name,
                        COUNT(od.id) as total_orders,
                        COALESCE(SUM(od.quantity), 0) as total_quantity,
                        COALESCE(SUM(od.quantity * od.unit_price), 0) as total_revenue
                    FROM orderdetail od
                    JOIN productvariant pv ON od.product_variant_id = pv.id
                    JOIN product p ON pv.product_id = p.id
                    LEFT JOIN brand b ON p.brand_id = b.id
                    LEFT JOIN category c ON p.category_id = c.id
                    WHERE od.is_deleted = false
                    GROUP BY p.id, p.name, b.name, c.name
                    ORDER BY total_quantity DESC
                    LIMIT %s
                """, [limit])
                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                
                serializer = BestSellingSerializer(results, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 