from rest_framework import serializers
from apps.products.models.attribute import AttributeValue

class AttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttributeValue
        fields = ['id', 'name', 'value', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 