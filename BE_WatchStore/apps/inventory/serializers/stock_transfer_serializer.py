from rest_framework import serializers
from apps.inventory.models.stock_transfer import StockTransfer
from apps.products.serializers.product_serializer import ProductSerializer
from apps.products.serializers.variant_serializer import VariantSerializer

class StockTransferSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = VariantSerializer(read_only=True)
    
    class Meta:
        model = StockTransfer
        fields = ['id', 'product', 'variant', 'from_location', 'to_location',
                 'quantity', 'status', 'notes', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 