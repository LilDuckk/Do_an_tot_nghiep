from rest_framework import serializers
from ..models import User, UserAccount, Customer, Role, Permission, UserRole, RolePermission
from apps.stores.serializers.store import StoreSerializer

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'

class RolePermissionSerializer(serializers.ModelSerializer):
    permission = PermissionSerializer(read_only=True)
    
    class Meta:
        model = RolePermission
        fields = '__all__'

class RoleSerializer(serializers.ModelSerializer):
    permissions = RolePermissionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Role
        fields = '__all__'

class UserRoleSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    
    class Meta:
        model = UserRole
        fields = ['id', 'role']

class UserAccountSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    
    class Meta:
        model = UserAccount
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True}
        }

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff']

class CustomerSerializer(serializers.ModelSerializer):
    user = UserAccountSerializer(read_only=True)
    
    class Meta:
        model = Customer
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone',
            'address', 'birth_date', 'gender', 'notes', 'user'
        ] 