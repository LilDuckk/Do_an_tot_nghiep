from rest_framework import viewsets
from apps.inventory.models.inventory import Inventory
from apps.stores.serializers.store_serializer import StoreSerializer
from rest_framework.permissions import DjangoModelPermissions

class StoreInventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['store', 'product', 'variant']
    ordering_fields = ['created_at']
    ordering = ['-created_at'] 