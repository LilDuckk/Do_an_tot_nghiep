from rest_framework import viewsets
from apps.inventory.models.stock_transfer import StockTransfer
from apps.inventory.serializers.stock_transfer_serializer import StockTransferSerializer
from apps.core.utils import IsAdminUser

class StockTransferViewSet(viewsets.ModelViewSet):
    queryset = StockTransfer.objects.all()
    serializer_class = StockTransferSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['product', 'variant', 'from_location', 'to_location', 'status']
    ordering_fields = ['created_at']
    ordering = ['-created_at'] 