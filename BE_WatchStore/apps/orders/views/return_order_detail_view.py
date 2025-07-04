from rest_framework import viewsets
from apps.orders.models.return_order_detail import ReturnOrderDetail
from apps.orders.serializers.return_order_detail_serializer import ReturnOrderDetailSerializer
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, AllowAny, OR
from apps.core.mixins import SoftDeleteMixin

class ReturnOrderDetailViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    queryset = ReturnOrderDetail.objects.all()
    serializer_class = ReturnOrderDetailSerializer
    filterset_fields = ['return_order', 'order_detail', 'product_variant']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết chi tiết đơn trả hàng
            return [AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions() 