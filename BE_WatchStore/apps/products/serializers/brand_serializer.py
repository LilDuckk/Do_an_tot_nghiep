from rest_framework import serializers
from apps.products.models.brand import Brand

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'description', 'is_active', 'display_order', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 