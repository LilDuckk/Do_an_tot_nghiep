from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.products.models.attribute import AttributeValue, AttributeType, AttributeValuePriceAdjustment
from apps.products.serializers.attribute_serializer import (
    AttributeValueSerializer, AttributeTypeSerializer,
    AttributeValuePriceAdjustmentSerializer
)
from rest_framework.permissions import DjangoModelPermissions

class AttributeValuePriceAdjustmentViewSet(viewsets.ModelViewSet):
    queryset = AttributeValuePriceAdjustment.objects.all()
    serializer_class = AttributeValuePriceAdjustmentSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['attribute_value', 'product', 'price_adjustment']
    search_fields = ['attribute_value__value', 'product__name']
    ordering_fields = ['price_adjustment', 'created_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class AttributeValueViewSet(viewsets.ModelViewSet):
    queryset = AttributeValue.objects.all()
    serializer_class = AttributeValueSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['attribute_type', 'value']
    search_fields = ['value']
    ordering_fields = ['value', 'created_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class AttributeTypeViewSet(viewsets.ModelViewSet):
    queryset = AttributeType.objects.all()
    serializer_class = AttributeTypeSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['name', 'description']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

