from rest_framework import serializers
from apps.stores.models.employee import Employee
from apps.users.serializers.user_serializer import UserSerializer

class EmployeeSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    store_details = serializers.SerializerMethodField(read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    updated_by_details = UserSerializer(source='updated_by', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'user_details', 'name', 'phone', 'email',
            'address', 'employee_code', 'position', 'hire_date',
            'store', 'store_details', 'created_at', 'updated_at',
            'created_by', 'created_by_details', 'updated_by', 'updated_by_details',
            'auto_create'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'employee_code', 'position']
        extra_kwargs = {
            'name': {'required': True},
            'phone': {'required': True},
            'email': {'required': True}
        }

    def get_store_details(self, obj):
        if obj.store:
            from apps.stores.serializers.store_serializer import StoreSerializer
            return StoreSerializer(obj.store).data
        return None

    def create(self, validated_data):
        # Lấy position từ group_permissions của user nếu có
        if validated_data.get('user'):
            user = validated_data['user']
            if user.groups.exists():
                group = user.groups.first()
                validated_data['position'] = group.name
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Cập nhật position nếu user thay đổi
        if 'user' in validated_data and validated_data['user'] != instance.user:
            user = validated_data['user']
            if user.groups.exists():
                group = user.groups.first()
                validated_data['position'] = group.name
        return super().update(instance, validated_data)