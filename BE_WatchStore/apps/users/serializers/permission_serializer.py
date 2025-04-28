from rest_framework import serializers
from apps.users.models.permission import Permission

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'description', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 