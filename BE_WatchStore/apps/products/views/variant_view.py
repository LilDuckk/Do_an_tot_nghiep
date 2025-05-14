from rest_framework import viewsets
from apps.products.models.variant import ProductVariant
from apps.products.serializers.variant_serializer import VariantSerializer
from rest_framework.permissions import DjangoModelPermissions

class VariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = VariantSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['name', 'product']
    search_fields = ['name', 'sku']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at'] 