from rest_framework import serializers
from apps.inventory.models.stock_take import StockTake
from apps.products.serializers.product_serializer import ProductSerializer, ProductVariantSerializer

class StockTakeSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    
    class Meta:
        model = StockTake
        fields = ['id', 'product', 'variant', 'system_quantity', 'actual_quantity',
                 'difference', 'notes', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 