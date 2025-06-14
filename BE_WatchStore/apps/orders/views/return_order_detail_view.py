from rest_framework import viewsets
from apps.orders.models.return_order_detail import ReturnOrderDetail
from apps.orders.serializers.return_order_detail_serializer import ReturnOrderDetailSerializer
from apps.core.utils.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated
from apps.core.mixins import SoftDeleteMixin

class ReturnOrderDetailViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    queryset = ReturnOrderDetail.objects.all()
    serializer_class = ReturnOrderDetailSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['return_order', 'product', 'variant']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết chi tiết đơn trả hàng
            return [IsAuthenticated()]
        return super().get_permissions() 