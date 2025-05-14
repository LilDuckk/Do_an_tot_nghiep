from rest_framework import viewsets
from apps.products.models.product_image import ProductImage
from apps.products.serializers.product_image_serializer import ProductImageSerializer
from rest_framework.permissions import DjangoModelPermissions

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['product', 'product_variant', 'is_primary']
    search_fields = ['image_url', 'alt_text']
    ordering_fields = ['display_order', 'created_at']
    ordering = ['-created_at'] 