from rest_framework import viewsets
from apps.products.models.product import Product
from apps.products.serializers.product_serializer import ProductSerializer
from rest_framework.permissions import DjangoModelPermissions

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['name', 'category', 'brand', 'base_price', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'base_price', 'created_at']
    ordering = ['-created_at'] 