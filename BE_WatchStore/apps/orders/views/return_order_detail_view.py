from rest_framework import viewsets
from apps.orders.models.return_order_detail import ReturnOrderDetail
from apps.orders.serializers.return_order_detail_serializer import ReturnOrderDetailSerializer
from rest_framework.permissions import DjangoModelPermissions
from apps.core.mixins import SoftDeleteMixin

class ReturnOrderDetailViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    queryset = ReturnOrderDetail.objects.all()
    serializer_class = ReturnOrderDetailSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['return_order', 'product', 'variant']
    ordering_fields = ['created_at']
    ordering = ['-created_at'] 