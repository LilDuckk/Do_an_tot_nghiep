from rest_framework import serializers
from apps.stores.models.store import Store
from apps.users.serializers.user_serializer import UserSerializer
import random

class StoreSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    updated_by_details = UserSerializer(source='updated_by', read_only=True)
    managers = serializers.SerializerMethodField(read_only=True)
    manager_id = serializers.PrimaryKeyRelatedField(
        queryset=Store._meta.get_field('manager').related_model.objects.all(),
        source='manager',
        required=False,
        allow_null=True,
        write_only=True
    )
    manager = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Store
        fields = ['id', 'name', 'address', 'phone', 'store_code', 'is_active', 'created_at', 'updated_at',
                 'created_by', 'created_by_details', 'updated_by', 'updated_by_details',
                 'manager', 'manager_id', 'managers']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'manager', 'store_code', 'managers']

    def get_manager(self, obj):
        if obj.manager:
            return {
                'id': obj.manager.id,
                'name': obj.manager.name,
                'employee_code': obj.manager.employee_code,
                'position': obj.manager.position,
                'manager_id': obj.manager.id
            }
        return None

    def get_managers(self, obj):
        managers = obj.employees.filter(is_manager=True)
        return [{
            'id': manager.id,
            'name': manager.name,
            'employee_code': manager.employee_code,
            'position': manager.position,
            'email': manager.email,
            'phone': manager.phone
        } for manager in managers]

    def create(self, validated_data):
        # Tạo store_code từ name và address
        name = validated_data.get('name', '').replace(' ', '').upper()
        address = validated_data.get('address', '').replace(' ', '').upper()
        random_num = str(random.randint(1000, 9999))
        
        # Kết hợp name, address và số ngẫu nhiên
        store_code = f"{name[:3]}{address[:3]}{random_num}"
        
        # Thêm store_code vào validated_data
        validated_data['store_code'] = store_code
        
        return super().create(validated_data)