from rest_framework import serializers
from apps.stores.models.employee import Employee
from apps.users.serializers.user_serializer import UserSerializer
from apps.stores.serializers.base_serializer import BaseEmployeeSerializer

class EmployeeSerializer(BaseEmployeeSerializer):
    store = serializers.SerializerMethodField()
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

    class Meta(BaseEmployeeSerializer.Meta):
        fields = BaseEmployeeSerializer.Meta.fields + [
            'user_id', 'hire_date', 'store', 'store_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_store(self, obj):
        from apps.stores.serializers.store_serializer import StoreSerializer
        if obj.store:
            return StoreSerializer(obj.store).data
        return None