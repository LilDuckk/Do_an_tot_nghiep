from rest_framework import viewsets
from apps.orders.models.return_order import ReturnOrder
from apps.orders.serializers.return_order_serializer import ReturnOrderSerializer
from apps.core.utils import IsAdminUser

class ReturnOrderViewSet(viewsets.ModelViewSet):
    queryset = ReturnOrder.objects.all()
    serializer_class = ReturnOrderSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['order', 'status']
    search_fields = ['return_number']
    ordering_fields = ['return_number', 'created_at']
    ordering = ['-created_at'] 