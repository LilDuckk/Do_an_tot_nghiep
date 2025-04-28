from rest_framework import viewsets
from apps.warranty.models.warranty import Warranty
from apps.warranty.serializers.warranty_serializer import WarrantySerializer
from apps.core.utils import IsAdminUser

class WarrantyViewSet(viewsets.ModelViewSet):
    queryset = Warranty.objects.all()
    serializer_class = WarrantySerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['product', 'variant', 'status']
    search_fields = ['warranty_number']
    ordering_fields = ['warranty_number', 'created_at']
    ordering = ['-created_at'] 