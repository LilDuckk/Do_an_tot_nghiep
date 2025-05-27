from rest_framework import viewsets
from apps.orders.models.return_order import ReturnOrder
from apps.orders.serializers.return_order_serializer import ReturnOrderSerializer
from rest_framework.permissions import DjangoModelPermissions
from apps.core.mixins import SoftDeleteMixin

class ReturnOrderViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    queryset = ReturnOrder.objects.all()
    serializer_class = ReturnOrderSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['order', 'status']
    search_fields = ['return_number']
    ordering_fields = ['return_number', 'created_at']
    ordering = ['-created_at'] 