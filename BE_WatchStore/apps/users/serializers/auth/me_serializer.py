from rest_framework import serializers
from apps.users.models.user import UserAccount
from apps.users.serializers.role_serializer import RoleSerializer

class MeSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)

    class Meta:
        model = UserAccount
        fields = ['id', 'username', 'email', 'role', 'is_active']
