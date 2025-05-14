from rest_framework import serializers
from apps.users.models.user import UserAccount
from apps.users.serializers.role_serializer import RoleSerializer
from apps.users.models.role import Role


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(),
        source='role',
        write_only=True,
        required=True
    )

    class Meta:
        model = UserAccount
        fields = [
            'id',
            'username',
            'email',
            'role',
            'role_id',
            'is_active',
            'is_staff',
            'is_superuser',
            'password',
        ]
        read_only_fields = ['is_staff', 'is_superuser']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data['is_staff'] = True  # Set is_staff=True by default
        user = UserAccount(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance