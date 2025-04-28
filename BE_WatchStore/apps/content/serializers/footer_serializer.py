from rest_framework import serializers
from apps.content.models.footer import Footer

class FooterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Footer
        fields = ['id', 'title', 'content', 'position', 'is_active',
                 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 