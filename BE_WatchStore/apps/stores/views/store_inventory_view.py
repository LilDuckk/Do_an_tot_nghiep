from rest_framework import viewsets
from apps.stores.models.store_inventory import StoreInventory
from apps.stores.serializers.store_inventory_serializer import StoreInventorySerializer
from apps.core.utils import IsAdminUser

class StoreInventoryViewSet(viewsets.ModelViewSet):
    queryset = StoreInventory.objects.all()
    serializer_class = StoreInventorySerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['store', 'product', 'variant']
    ordering_fields = ['created_at']
    ordering = ['-created_at'] 