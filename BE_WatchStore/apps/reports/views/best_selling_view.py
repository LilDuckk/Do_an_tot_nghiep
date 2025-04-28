from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from apps.reports.serializers.best_selling_serializer import BestSellingSerializer

class BestSellingView(APIView):
    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        p.id as product_id,
                        p.name as product_name,
                        b.name as brand_name,
                        c.name as category_name,
                        COUNT(od.id) as total_orders,
                        SUM(od.quantity) as total_quantity,
                        SUM(od.quantity * od.unit_price) as total_revenue
                    FROM orderdetail od
                    JOIN productvariant pv ON od.product_variant_id = pv.id
                    JOIN product p ON pv.product_id = p.id
                    LEFT JOIN brand b ON p.brand_id = b.id
                    LEFT JOIN category c ON p.category_id = c.id
                    WHERE od.is_deleted = false
                    GROUP BY p.id, p.name, b.name, c.name
                    ORDER BY total_quantity DESC
                    LIMIT 10
                """)
                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                
                serializer = BestSellingSerializer(results, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 