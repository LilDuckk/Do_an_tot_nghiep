from rest_framework import viewsets
from apps.products.models.attribute import AttributeValue, AttributeType
from apps.products.serializers.attribute_serializer import AttributeValueSerializer, AttributeTypeSerializer
from rest_framework.permissions import DjangoModelPermissions

class AttributeValueViewSet(viewsets.ModelViewSet):
    queryset = AttributeValue.objects.all()
    serializer_class = AttributeValueSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['attribute_type', 'value']
    search_fields = ['value']
    ordering_fields = ['value', 'created_at']
    ordering = ['-created_at']

class AttributeTypeViewSet(viewsets.ModelViewSet):
    queryset = AttributeType.objects.all()
    serializer_class = AttributeTypeSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['name', 'description']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

