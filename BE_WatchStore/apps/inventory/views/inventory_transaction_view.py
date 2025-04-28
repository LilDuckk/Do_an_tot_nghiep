from rest_framework import viewsets
from apps.inventory.models.inventory_transaction import InventoryTransaction
from apps.inventory.serializers.inventory_transaction_serializer import InventoryTransactionSerializer
from apps.core.permissions import IsAdminUser

class InventoryTransactionViewSet(viewsets.ModelViewSet):
    queryset = InventoryTransaction.objects.all()
    serializer_class = InventoryTransactionSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['product', 'variant', 'transaction_type']
    search_fields = ['reference_number']
    ordering_fields = ['created_at']
    ordering = ['-created_at'] 