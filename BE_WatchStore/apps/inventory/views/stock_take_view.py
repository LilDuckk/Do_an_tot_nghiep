from rest_framework import viewsets
from apps.inventory.models.stock_take import StockTake
from apps.inventory.serializers.stock_take_serializer import StockTakeSerializer
from apps.core.utils import IsAdminUser

class StockTakeViewSet(viewsets.ModelViewSet):
    queryset = StockTake.objects.all()
    serializer_class = StockTakeSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['product', 'variant']
    ordering_fields = ['created_at']
    ordering = ['-created_at'] 