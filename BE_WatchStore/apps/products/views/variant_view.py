from rest_framework import viewsets
from apps.products.models.variant import ProductVariant
from apps.products.serializers.variant_serializer import ProductVariantSerializer, VariantSerializer
from rest_framework.permissions import DjangoModelPermissions

class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['product', 'sku', 'barcode', 'is_active']
    search_fields = ['sku', 'barcode']
    ordering_fields = ['sku', 'created_at']
    ordering = ['-created_at']

class VariantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = VariantSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['product', 'sku', 'barcode', 'is_active']
    search_fields = ['sku', 'barcode']
    ordering_fields = ['sku', 'created_at']
    ordering = ['-created_at'] 