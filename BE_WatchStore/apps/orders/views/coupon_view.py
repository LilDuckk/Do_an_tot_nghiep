from rest_framework import viewsets
from apps.orders.models.coupon import Coupon
from apps.orders.serializers.coupon_serializer import CouponSerializer
from apps.core.utils.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated
from apps.core.mixins import SoftDeleteMixin

class CouponViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['code', 'discount_type', 'is_active']
    search_fields = ['code']
    ordering_fields = ['code', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết mã giảm giá
            return [IsAuthenticated()]
        return super().get_permissions() 