from rest_framework import viewsets
from apps.products.models.variant import ProductVariant
from apps.products.serializers.variant_serializer import VariantSerializer
from apps.core.utils import IsAdminUser

class VariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = VariantSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['product', 'sku', 'price', 'sale_price', 'stock']
    search_fields = ['sku']
    ordering_fields = ['sku', 'price', 'created_at']
    ordering = ['-created_at'] 