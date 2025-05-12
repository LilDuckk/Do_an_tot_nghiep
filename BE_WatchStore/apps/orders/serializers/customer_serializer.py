from rest_framework import serializers
from apps.orders.models.customer import Customer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'address',
            'birth_date',
            'gender',
            'notes',
            'is_deleted',
            'created_at',
            'updated_at',
            'created_by',
            'updated_by',
        ]
        read_only_fields = ['created_at', 'updated_at']
