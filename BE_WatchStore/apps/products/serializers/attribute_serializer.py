from rest_framework import serializers
from apps.products.models.attribute import AttributeValue, AttributeType


class AttributeValueSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = AttributeValue
        fields = ['id', 'attribute_type', 'value', 'price_adjustments', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')

class AttributeTypeSerializer(serializers.ModelSerializer):
    attribute_values = AttributeValueSerializer(many=True, read_only=True)
    
    class Meta:
        model = AttributeType
        fields = ['id', 'name', 'description', 'attribute_values', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 