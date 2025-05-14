from rest_framework import serializers
from apps.users.models.user import UserAccount

class MeSerializer(serializers.ModelSerializer):
    # role = RoleSerializer(read_only=True)

    class Meta:
        model = UserAccount
        fields = ['id', 'username', 'email', 'is_active', 'is_staff']
