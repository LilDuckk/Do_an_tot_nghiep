from rest_framework import serializers
from apps.content.models.contact_info import ContactInfo

class ContactInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInfo
        fields = ['id', 'title', 'content', 'type', 'is_active',
                 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 