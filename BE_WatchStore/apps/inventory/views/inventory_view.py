from rest_framework import viewsets
from apps.inventory.models.inventory import Inventory
from apps.inventory.serializers.inventory_serializer import InventorySerializer
from rest_framework.permissions import DjangoModelPermissions

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['product', 'variant', 'location']
    ordering_fields = ['created_at']
    ordering = ['-created_at'] 