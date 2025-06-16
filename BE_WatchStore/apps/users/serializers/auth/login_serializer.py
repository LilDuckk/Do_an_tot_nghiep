from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models.user import UserAccount
from apps.users.serializers.user_serializer import GroupInfoSerializer
from django.contrib.auth.models import Permission


class PermissionInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'codename']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Thông tin đăng nhập không chính xác")
        if not user.is_active:
            raise serializers.ValidationError("Tài khoản đã bị khóa")
        
        refresh = RefreshToken.for_user(user)
        
        # Lấy tất cả quyền của user (bao gồm cả quyền từ groups)
        user_permissions = Permission.objects.filter(
            group__user=user
        ).distinct()
        
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'groups': GroupInfoSerializer(user.groups.all(), many=True).data,
                'permissions': PermissionInfoSerializer(user_permissions, many=True).data
            }
        }
