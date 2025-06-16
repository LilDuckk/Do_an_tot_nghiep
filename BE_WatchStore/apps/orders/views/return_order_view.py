from rest_framework import viewsets
from apps.orders.models.return_order import ReturnOrder
from apps.orders.serializers.return_order_serializer import ReturnOrderSerializer
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, AllowAny, OR
from apps.core.mixins import SoftDeleteMixin

class ReturnOrderViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    queryset = ReturnOrder.objects.all()
    serializer_class = ReturnOrderSerializer
    filterset_fields = ['order', 'status']
    search_fields = ['return_number']
    ordering_fields = ['return_number', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết đơn trả hàng
            return [AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions() 