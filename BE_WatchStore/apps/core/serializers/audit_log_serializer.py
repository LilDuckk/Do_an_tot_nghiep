from rest_framework import serializers
from apps.core.models.audit_log import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at') 