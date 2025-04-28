from rest_framework import serializers
from apps.orders.models.order_detail import OrderDetail
from apps.products.serializers.product_serializer import ProductSerializer
from apps.products.serializers.variant_serializer import VariantSerializer

class OrderDetailSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = VariantSerializer(read_only=True)
    
    class Meta:
        model = OrderDetail
        fields = ['id', 'order', 'product', 'variant', 'quantity',
                 'price', 'total_price', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 