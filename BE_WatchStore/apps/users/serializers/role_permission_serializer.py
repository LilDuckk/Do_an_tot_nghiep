from rest_framework import serializers
from apps.users.models.role_permission import RolePermission
from apps.users.serializers.role_serializer import RoleSerializer
from apps.users.serializers.permission_serializer import PermissionSerializer
from apps.core.serializers.base_serializer import BaseSerializer

class RolePermissionSerializer(BaseSerializer):
    role = RoleSerializer(read_only=True)
    permission = PermissionSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=RolePermission.objects.all(),
        source='role',
        write_only=True
    )
    permission_id = serializers.PrimaryKeyRelatedField(
        queryset=RolePermission.objects.all(),
        source='permission',
        write_only=True
    )

    class Meta(BaseSerializer.Meta):
        model = RolePermission
        fields = BaseSerializer.Meta.fields + [
            'role', 'role_id', 'permission', 'permission_id'
        ] 