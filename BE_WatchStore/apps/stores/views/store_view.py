from rest_framework import viewsets
from apps.stores.models.store import Store
from apps.stores.serializers.store_serializer import StoreSerializer
from apps.core.utils import IsAdminUser

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['name', 'address', 'is_active']
    search_fields = ['name', 'address', 'phone', 'email']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at'] 