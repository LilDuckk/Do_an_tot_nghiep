from rest_framework import serializers
from apps.content.models.news import News

class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = ['id', 'title', 'content', 'image', 'slug', 'is_active',
                 'published_date', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 