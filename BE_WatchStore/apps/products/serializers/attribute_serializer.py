from rest_framework import serializers
from apps.products.models.attribute import AttributeValue, AttributeType

class AttributeValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttributeValue
        fields = ['id', 'attribute_type', 'value', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')

class AttributeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttributeType
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 