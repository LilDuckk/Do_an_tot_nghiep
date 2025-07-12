from rest_framework import serializers
from apps.content.models.contact_info import ContactInfo

class ContactInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInfo
        fields = ['id', 'company_name', 'address', 'phone', 'email', 
                 'working_hours', 'facebook_url', 'instagram_url', 
                 'youtube_url', 'tiktok_url', 'is_active',
                 'created_at', 'updated_at', 'created_by', 'updated_by']
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by') 