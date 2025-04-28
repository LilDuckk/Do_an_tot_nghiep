from rest_framework import serializers
from apps.inventory.models.stock_take import StockTake
from apps.products.serializers.product_serializer import ProductSerializer
from apps.products.serializers.variant_serializer import VariantSerializer

class StockTakeSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = VariantSerializer(read_only=True)
    
    class Meta:
        model = StockTake
        fields = ['id', 'product', 'variant', 'system_quantity', 'actual_quantity',
                 'difference', 'notes', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 