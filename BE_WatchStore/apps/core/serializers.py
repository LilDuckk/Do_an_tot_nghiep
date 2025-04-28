from rest_framework import serializers
from .models.audit_log import AuditLog
from apps.users.serializers import UserAccountSerializer

class AuditLogSerializer(serializers.ModelSerializer):
    user = UserAccountSerializer(read_only=True)
    content_type_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'content_type', 'object_id', 'content_type_name',
            'action', 'old_values', 'new_values', 'user',
            'ip_address', 'user_agent', 'created_at'
        ]
        read_only_fields = fields
        
    def get_content_type_name(self, obj):
        return obj.content_type.model 