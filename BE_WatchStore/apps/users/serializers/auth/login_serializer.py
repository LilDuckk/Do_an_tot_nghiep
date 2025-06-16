from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from apps.users.models.user import UserAccount
from apps.users.serializers.user_serializer import GroupInfoSerializer
from django.contrib.auth.models import Permission
from apps.stores.models.employee import Employee
from apps.stores.serializers.employee_serializer import EmployeeSerializer
from apps.stores.serializers.store_serializer import StoreSerializer
import logging

logger = logging.getLogger(__name__)

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

        logger.info(f"User {user.username} permissions:")
        logger.info(f"Direct permissions: {[p.codename for p in user.user_permissions.all()]}")
        logger.info(f"Group permissions: {[p.codename for p in user_permissions]}")
        logger.info(f"All permissions: {list(user.get_all_permissions())}")

        # Lấy thông tin employee và store nếu có
        employee_data = None
        store_data = None
        try:
            employee = Employee.objects.get(user=user, is_deleted=False)
            employee_data = EmployeeSerializer(employee).data
            if employee.store:
                store_data = StoreSerializer(employee.store).data
                logger.info(f"User {user.username} is employee of store {employee.store.id}")
        except Employee.DoesNotExist:
            logger.warning(f"User {user.username} is not an employee")
            pass
        
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
                'permissions': PermissionInfoSerializer(user_permissions, many=True).data,
                'employee': employee_data,
                'store': store_data
            }
        }
