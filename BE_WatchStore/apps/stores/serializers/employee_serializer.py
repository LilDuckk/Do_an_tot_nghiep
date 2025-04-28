from rest_framework import serializers
from apps.stores.models.employee import Employee
from apps.users.serializers.user_serializer import UserAccountSerializer
from apps.stores.serializers.store_serializer import StoreSerializer

class EmployeeSerializer(serializers.ModelSerializer):
    user = UserAccountSerializer(read_only=True)
    store = StoreSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(),
        source='user',
        write_only=True
    )
    store_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(),
        source='store',
        write_only=True
    )

    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'user_id', 'first_name', 'last_name',
            'phone', 'address', 'employee_code', 'position',
            'hire_date', 'store', 'store_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at'] 