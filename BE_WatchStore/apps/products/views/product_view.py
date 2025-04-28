from rest_framework import viewsets
from apps.products.models.product import Product
from apps.products.serializers.product_serializer import ProductSerializer
from apps.core.utils import IsAdminUser

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['name', 'category', 'brand', 'price', 'sale_price', 'stock']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['-created_at'] 