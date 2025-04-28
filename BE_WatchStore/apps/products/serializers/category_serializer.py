from rest_framework import serializers
from apps.products.models.category import Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'parent', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 