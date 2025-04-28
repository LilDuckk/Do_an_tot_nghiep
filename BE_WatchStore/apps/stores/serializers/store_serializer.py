from rest_framework import serializers
from apps.stores.models.store import Store
from apps.stores.serializers.employee_serializer import EmployeeSerializer
from apps.users.serializers.user_serializer import UserAccountSerializer

class StoreSerializer(serializers.ModelSerializer):
    manager = EmployeeSerializer(read_only=True)
    created_by = UserAccountSerializer(read_only=True)
    updated_by = UserAccountSerializer(read_only=True)
    manager_id = serializers.PrimaryKeyRelatedField(
        queryset=Store.objects.all(),
        source='manager',
        write_only=True
    )

    class Meta:
        model = Store
        fields = [
            'id', 'name', 'address', 'phone', 'store_code',
            'opening_date', 'is_active', 'manager', 'manager_id',
            'created_by', 'updated_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at'] 