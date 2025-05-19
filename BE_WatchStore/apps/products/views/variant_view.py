from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.products.models.variant import ProductVariant, ProductVariantAttribute
from apps.products.serializers.variant_serializer import ProductVariantSerializer, VariantSerializer, ProductVariantAttributeSerializer
from rest_framework.permissions import DjangoModelPermissions

class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['product', 'sku', 'barcode', 'is_active']
    search_fields = ['sku', 'barcode']
    ordering_fields = ['sku', 'created_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class VariantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = VariantSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['product', 'sku', 'barcode', 'is_active']
    search_fields = ['sku', 'barcode']
    ordering_fields = ['sku', 'created_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class ProductVariantAttributeViewSet(viewsets.ModelViewSet):
    queryset = ProductVariantAttribute.objects.all()
    serializer_class = ProductVariantAttributeSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['product_variant', 'attribute_value']
    search_fields = ['product_variant__sku', 'attribute_value__value']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data) 