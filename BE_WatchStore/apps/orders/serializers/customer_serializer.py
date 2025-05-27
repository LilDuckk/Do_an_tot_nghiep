from rest_framework import serializers
from apps.orders.models.customer import Customer
from apps.core.serializers import BaseSerializer

class CustomerSerializer(BaseSerializer):
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
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
        extra_kwargs = {
            'first_name': {'required': True},
            'phone': {'required': True},
            'gender': {'required': True},
            'last_name': {'required': False},
            'email': {'required': False},
            'address': {'required': False},
            'birth_date': {'required': False},
            'notes': {'required': False}
        }
