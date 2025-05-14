from rest_framework import viewsets
from apps.products.models.category import Category
from apps.products.serializers.category_serializer import CategorySerializer
from rest_framework.permissions import DjangoModelPermissions

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['name']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at'] 