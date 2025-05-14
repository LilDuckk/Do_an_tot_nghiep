from rest_framework import serializers
from apps.users.models.user import UserAccount
from django.contrib.auth.models import Group


class GroupInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    groups = GroupInfoSerializer(many=True, read_only=True)
    groups_id = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        many=True,
        required=False,
        write_only=True
    )

    class Meta:
        model = UserAccount
        fields = [
            'id',
            'username',
            'email',
            'is_active',
            'is_staff',
            'is_superuser',
            'password',
            'groups',      # Trả về thông tin group (id, name)
            'groups_id',   # Nhận danh sách id group khi tạo/cập nhật
        ]
        read_only_fields = ['is_staff', 'is_superuser']

    def create(self, validated_data):
        groups_data = validated_data.pop('groups_id', None)
        password = validated_data.pop('password', None)
        validated_data['is_staff'] = True  # Set is_staff=True by default
        user = UserAccount(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        if groups_data:
            user.groups.set(groups_data)
        return user

    def update(self, instance, validated_data):
        groups_data = validated_data.pop('groups_id', None)
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if groups_data is not None:
            instance.groups.set(groups_data)
        return instance