from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, OR
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from django.db import connection
from apps.reports.serializers.top_customers_serializer import TopCustomersSerializer

class TopCustomersView(APIView):

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.request.method == 'GET':
            # Cho phép user đã đăng nhập xem báo cáo khách hàng hàng đầu
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        c.id as customer_id,
                        c.first_name,
                        c.last_name,
                        c.email,
                        c.phone,
                        COUNT(DISTINCT o.id) as total_orders,
                        SUM(o.total_amount) as total_spent,
                        MAX(o.order_date) as last_order_date
                    FROM customer c
                    LEFT JOIN orders o ON c.id = o.customer_id
                    WHERE c.is_deleted = false AND o.is_deleted = false
                    GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone
                    ORDER BY total_spent DESC
                    LIMIT 10
                """)
                columns = [col[0] for col in cursor.description]
                results = [dict(zip(columns, row)) for row in cursor.fetchall()]
                
                serializer = TopCustomersSerializer(results, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 