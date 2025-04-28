from rest_framework import serializers
from apps.content.models.banner import Banner

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ['id', 'title', 'image', 'link', 'position', 'is_active',
                 'start_date', 'end_date', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 