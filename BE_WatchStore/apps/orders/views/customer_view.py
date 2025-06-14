from rest_framework import viewsets
from apps.orders.models.customer import Customer
from apps.orders.serializers.customer_serializer import CustomerSerializer
from apps.core.utils.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated
from apps.core.mixins import SoftDeleteMixin

class CustomerViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['first_name', 'last_name', 'email', 'phone', 'birth_date', 'gender']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết khách hàng
            return [IsAuthenticated()]
        return super().get_permissions() 
