from rest_framework import serializers
from apps.stores.models.supplier import Supplier
from apps.users.serializers.user_serializer import UserAccountSerializer

class SupplierSerializer(serializers.ModelSerializer):
    created_by = UserAccountSerializer(read_only=True)
    updated_by = UserAccountSerializer(read_only=True)

    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'contact_person', 'email', 'phone',
            'address', 'tax_code', 'website', 'is_active',
            'created_by', 'updated_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at'] 