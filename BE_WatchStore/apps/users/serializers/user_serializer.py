from rest_framework import serializers
from apps.users.models.user import UserAccount
from django.contrib.auth.models import Group
from django.db import IntegrityError


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
    employee_details = serializers.SerializerMethodField(read_only=True)

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
            'employee_details',
        ]
        read_only_fields = ['is_staff', 'is_superuser']

    def create(self, validated_data):
        groups_data = validated_data.pop('groups_id', None)
        password = validated_data.pop('password', None)
        validated_data['is_staff'] = True  # Set is_staff=True by default
        user = UserAccount(**validated_data)
        if password:
            user.set_password(password)
        try:
            user.save()
        except IntegrityError as e:
            if 'useraccount_email_key' in str(e):
                raise serializers.ValidationError({'email': 'Email đã tồn tại.'})
            raise e # Re-raise other integrity errors

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

    def validate(self, attrs):
        # Lấy thông tin group và is_superuser từ dữ liệu đầu vào
        groups = attrs.get('groups_id', None)
        is_superuser = attrs.get('is_superuser', False)
        # Nếu không phải superuser thì phải có ít nhất 1 group
        if not is_superuser:
            if not groups or len(groups) == 0:
                raise serializers.ValidationError({
                    'groups_id': 'Tài khoản phải thuộc ít nhất 1 group, trừ khi là tài khoản superuser.'
                })
        return attrs

    def get_employee_details(self, obj):
        if hasattr(obj, 'employee_user_set') and obj.employee_user_set.filter(is_deleted=False).exists():
            employee = obj.employee_user_set.filter(is_deleted=False).first()
            return {
                'id': employee.id,
                'name': employee.name,
                'employee_code': employee.employee_code,
                'position': employee.position,
                'store': employee.store.id if employee.store and not employee.store.is_deleted else None,
                'store_name': employee.store.name if employee.store and not employee.store.is_deleted else None
            }
        return None