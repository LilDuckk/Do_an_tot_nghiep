from rest_framework import viewsets, permissions, filters
from django_filters import rest_framework as django_filters
from ..models import Product, ProductVariant, ProductImage, ProductVariantAttribute
from ..serializers import (
    ProductSerializer, ProductVariantSerializer,
    ProductImageSerializer, ProductVariantAttributeSerializer
)

class ProductFilter(django_filters.FilterSet):
    class Meta:
        model = Product
        fields = {
            'name': ['exact', 'icontains'],
            'brand': ['exact'],
            'category': ['exact'],
            'is_active': ['exact'],
            'created_at': ['exact', 'gte', 'lte'],
            'updated_at': ['exact', 'gte', 'lte']
        }

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_class = ProductFilter
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']

class ProductVariantFilter(django_filters.FilterSet):
    class Meta:
        model = ProductVariant
        fields = {
            'product': ['exact'],
            'sku': ['exact', 'icontains'],
            'price_adjustment': ['exact', 'gte', 'lte'],
            'stock_alert_threshold': ['exact', 'gte', 'lte'],
            'barcode': ['exact', 'icontains'],
            'is_active': ['exact'],
            'created_at': ['exact', 'gte', 'lte'],
            'updated_at': ['exact', 'gte', 'lte']
        }

class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend]
    filterset_class = ProductVariantFilter
    ordering_fields = ['sku', 'price_adjustment', 'stock_alert_threshold', 'created_at', 'updated_at']
    ordering = ['-created_at']

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product', 'product_variant', 'is_primary']
    search_fields = ['alt_text']
    ordering_fields = ['display_order', 'created_at']
    ordering = ['display_order']

class ProductVariantAttributeViewSet(viewsets.ModelViewSet):
    queryset = ProductVariantAttribute.objects.all()
    serializer_class = ProductVariantAttributeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [django_filters.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['product_variant', 'attribute_value']
    ordering_fields = ['created_at']
    ordering = ['-created_at'] 