from rest_framework import serializers
from apps.orders.models.return_order_detail import ReturnOrderDetail
from apps.products.serializers.product_serializer import ProductSerializer
from apps.products.serializers.variant_serializer import VariantSerializer

class ReturnOrderDetailSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = VariantSerializer(read_only=True)
    
    class Meta:
        model = ReturnOrderDetail
        fields = ['id', 'return_order', 'product', 'variant', 'quantity',
                 'price', 'total_price', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 