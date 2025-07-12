from rest_framework import serializers
from apps.content.models.news import News, NewsCategory

class NewsCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsCategory
        fields = ['id', 'name', 'slug', 'description', 'display_order', 
                 'is_active', 'created_at', 'updated_at', 'created_by', 'updated_by']
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')

class NewsSerializer(serializers.ModelSerializer):
    category_details = NewsCategorySerializer(source='category', read_only=True)
    
    class Meta:
        model = News
        fields = ['id', 'title', 'slug', 'content', 'summary', 'category', 
                 'category_details', 'featured_image', 'is_published', 'publish_date', 'meta_title', 
                 'meta_description', 'view_count', 'created_at', 'updated_at', 
                 'created_by', 'updated_by']
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'view_count') 