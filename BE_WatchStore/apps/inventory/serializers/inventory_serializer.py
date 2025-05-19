from rest_framework import serializers
from apps.inventory.models.inventory import Inventory
from apps.products.serializers.product_serializer import ProductSerializer, ProductVariantSerializer

class InventorySerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    
    class Meta:
        model = Inventory
        fields = ['id', 'product', 'variant', 'quantity', 'location',
                 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 