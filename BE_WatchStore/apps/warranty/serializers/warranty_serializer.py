from rest_framework import serializers
from apps.warranty.models.warranty import Warranty
from apps.products.serializers.product_serializer import ProductSerializer, ProductVariantSerializer

class WarrantySerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    
    class Meta:
        model = Warranty
        fields = ['id', 'product', 'variant', 'warranty_number', 'start_date',
                 'end_date', 'status', 'notes', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 