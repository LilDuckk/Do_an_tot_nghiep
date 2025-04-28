from rest_framework import viewsets
from apps.products.models.category import Category
from apps.products.serializers.category_serializer import CategorySerializer
from apps.core.utils import IsAdminUser

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['name', 'parent']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at'] 