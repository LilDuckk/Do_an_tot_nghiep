from rest_framework import viewsets
from apps.orders.models.coupon import Coupon
from apps.orders.serializers.coupon_serializer import CouponSerializer
from rest_framework.permissions import DjangoModelPermissions
from apps.core.mixins import SoftDeleteMixin

class CouponViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['code', 'discount_type', 'is_active']
    search_fields = ['code']
    ordering_fields = ['code', 'created_at']
    ordering = ['-created_at'] 