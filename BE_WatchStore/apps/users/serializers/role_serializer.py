from rest_framework import serializers
from apps.users.models.role import Role
from apps.users.serializers.permission_serializer import PermissionSerializer

class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Role
        fields = ['id', 'name', 'description', 'permissions', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 