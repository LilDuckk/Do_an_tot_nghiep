from rest_framework import serializers
from apps.core.models.base import BaseModel

class BaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = BaseModel
        fields = [
            'id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at'] 