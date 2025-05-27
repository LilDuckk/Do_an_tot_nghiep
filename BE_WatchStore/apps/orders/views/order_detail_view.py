from rest_framework import viewsets
from apps.orders.models.order_detail import OrderDetail
from apps.orders.serializers.order_detail_serializer import OrderDetailSerializer
from rest_framework.permissions import DjangoModelPermissions
from apps.core.mixins import SoftDeleteMixin

class OrderDetailViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    queryset = OrderDetail.objects.all()
    serializer_class = OrderDetailSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['order', 'product_variant']
    ordering_fields = ['created_at']
    ordering = ['-created_at'] 