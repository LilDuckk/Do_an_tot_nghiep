from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.core.cache import cache
from django.db.models import Q
import itertools
from apps.products.models.product import Product
from apps.products.models.variant import ProductVariant, ProductVariantAttribute
from apps.products.models.attribute import AttributeValue, AttributeValuePriceAdjustment
from apps.products.serializers.product_serializer import (
    ProductSerializer, ProductDetailSerializer,
    ProductVariantSerializer, ProductVariantAttributeSerializer
)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return self.serializer_class
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
            
        # Filter by brand
        brand = self.request.query_params.get('brand', None)
        if brand:
            queryset = queryset.filter(brand_id=brand)
            
        # Filter by price range
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(base_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(base_price__lte=max_price)
            
        # Search by name or description
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
            
        # Filter by featured
        featured = self.request.query_params.get('featured', None)
        if featured:
            queryset = queryset.filter(is_featured=True)
            
        # Filter by active status
        active = self.request.query_params.get('active', None)
        if active:
            queryset = queryset.filter(is_active=True)
            
        # Thêm order_by để tránh cảnh báo UnorderedObjectListWarning
        queryset = queryset.order_by('id')
        
        # Add caching for frequently accessed products
        cache_key = f'product_list_{self.request.query_params.urlencode()}'
        cached_queryset = cache.get(cache_key)
        
        if cached_queryset is None:
            cached_queryset = queryset.select_related(
                'category', 'brand', 'default_variant'
            ).prefetch_related(
                'variants', 'variants__attributes', 'variants__attributes__attribute_value',
                'images'
            )
            cache.set(cache_key, cached_queryset, timeout=300)  # Cache for 5 minutes
            
        return cached_queryset

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def bulk_update_variants(self, request, pk=None):
        product = self.get_object()
        variants_data = request.data.get('variants', [])
        
        with transaction.atomic():
            # Delete existing variants
            product.variants.all().delete()
            
            # Create new variants
            for variant_data in variants_data:
                attributes_data = variant_data.pop('attributes', [])
                variant = ProductVariant.objects.create(product=product, **variant_data)
                
                for attr_data in attributes_data:
                    ProductVariantAttribute.objects.create(product_variant=variant, **attr_data)
                    
        return Response({'status': 'variants updated'})

    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_products = self.get_queryset().filter(is_featured=True)
        serializer = self.get_serializer(featured_products, many=True)
        return Response(serializer.data)

class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    
    def get_queryset(self):
        return super().get_queryset().select_related(
            'product'
        ).prefetch_related(
            'attributes', 'attributes__attribute_value'
        )

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class ProductVariantAttributeViewSet(viewsets.ModelViewSet):
    queryset = ProductVariantAttribute.objects.all()
    serializer_class = ProductVariantAttributeSerializer
    
    def get_queryset(self):
        return super().get_queryset().select_related(
            'product_variant', 'attribute_value'
        )
