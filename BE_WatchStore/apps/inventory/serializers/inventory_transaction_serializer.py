from rest_framework import serializers
from apps.inventory.models.inventory_transaction import InventoryTransaction
from apps.products.serializers.product_serializer import ProductSerializer
from apps.products.serializers.variant_serializer import VariantSerializer

class InventoryTransactionSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    variant = VariantSerializer(read_only=True)
    
    class Meta:
        model = InventoryTransaction
        fields = ['id', 'product', 'variant', 'transaction_type', 'quantity',
                 'reference_number', 'notes', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at') 