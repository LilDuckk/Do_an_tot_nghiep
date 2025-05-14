from rest_framework import viewsets
from apps.products.models.attribute import AttributeValue
from apps.products.models.attribute import AttributeType
from apps.products.serializers.attribute_serializer import AttributeSerializer
from rest_framework.permissions import DjangoModelPermissions

class AttributeValueViewSet(viewsets.ModelViewSet):
    queryset = AttributeValue.objects.all()
    serializer_class = AttributeSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['name', 'value']
    search_fields = ['name', 'value']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at'] 


class AttributeTypeViewSet(viewsets.ModelViewSet):
    queryset = AttributeType.objects.all()
    serializer_class = AttributeSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['name', 'description']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

