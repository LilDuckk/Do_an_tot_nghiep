from rest_framework import serializers
from apps.warranty.models.warranty import Warranty
from apps.products.serializers.product_serializer import ProductSerializer
from apps.products.serializers.variant_serializer import VariantSerializer

class WarrantySerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = VariantSerializer(read_only=True)
    
    class Meta:
        model = Warranty
        fields = ['id', 'product', 'variant', 'warranty_number', 'start_date',
                 'end_date', 'status', 'notes', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 