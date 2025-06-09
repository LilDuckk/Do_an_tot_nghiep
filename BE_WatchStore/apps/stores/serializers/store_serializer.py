from rest_framework import serializers
from apps.stores.models.store import Store
from apps.users.serializers.user_serializer import UserSerializer

class StoreSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    updated_by_details = UserSerializer(source='updated_by', read_only=True)
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
        fields = ['id', 'name', 'address', 'phone', 'is_active', 'created_at', 'updated_at',
                 'created_by', 'created_by_details', 'updated_by', 'updated_by_details',
                 'manager', 'manager_id']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'manager']

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