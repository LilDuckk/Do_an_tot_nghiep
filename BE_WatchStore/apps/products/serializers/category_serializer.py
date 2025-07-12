from rest_framework import serializers
from apps.products.models.category import Category

class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'parent', 'parent_name', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 