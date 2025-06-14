from rest_framework import viewsets
from apps.orders.models.order_detail import OrderDetail
from apps.orders.serializers.order_detail_serializer import OrderDetailSerializer
from apps.core.utils.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated
from apps.core.mixins import SoftDeleteMixin

class OrderDetailViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    queryset = OrderDetail.objects.all()
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['order', 'product_variant']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết chi tiết đơn hàng
            return [IsAuthenticated()]
        return super().get_permissions() 