from rest_framework import viewsets
from apps.inventory.models.inventory import Inventory
from apps.inventory.serializers.inventory_serializer import InventorySerializer
from apps.core.permissions import IsAdminUser

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['product', 'variant', 'location']
    ordering_fields = ['created_at']
    ordering = ['-created_at'] 