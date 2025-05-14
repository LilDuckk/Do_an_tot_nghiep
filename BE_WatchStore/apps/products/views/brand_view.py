from rest_framework import viewsets
from apps.products.models.brand import Brand
from apps.products.serializers.brand_serializer import BrandSerializer
from rest_framework.permissions import DjangoModelPermissions

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['name']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at'] 