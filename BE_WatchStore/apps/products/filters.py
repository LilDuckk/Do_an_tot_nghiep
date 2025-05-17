from django_filters import rest_framework as filters
from apps.products.models.product import Product

class ProductFilter(filters.FilterSet):
    min_price = filters.NumberFilter(field_name="base_price", lookup_expr='gte')
    max_price = filters.NumberFilter(field_name="base_price", lookup_expr='lte')
    
    class Meta:
        model = Product
        fields = {
            'name': ['exact', 'icontains'],
            'category': ['exact'],
            'brand': ['exact'],
            'is_active': ['exact'],
            'is_featured': ['exact'],
        } 