from rest_framework import serializers
from apps.products.models.attribute import AttributeValue, AttributeType, AttributeValuePriceAdjustment

class AttributeValuePriceAdjustmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttributeValuePriceAdjustment
        fields = ['id', 'attribute_value', 'product', 'price_adjustment', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')

class AttributeValueSerializer(serializers.ModelSerializer):
    price_adjustments = AttributeValuePriceAdjustmentSerializer(many=True, read_only=True)
    
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