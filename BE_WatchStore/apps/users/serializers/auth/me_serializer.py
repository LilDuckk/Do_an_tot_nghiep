from rest_framework import serializers
from apps.users.models.user import UserAccount
from apps.users.serializers.user_serializer import GroupInfoSerializer

class MeSerializer(serializers.ModelSerializer):
    groups = GroupInfoSerializer(many=True, read_only=True)

    class Meta:
        model = UserAccount
        fields = ['id', 'username', 'email', 'groups', 'is_active', 'is_staff', 'is_superuser']
