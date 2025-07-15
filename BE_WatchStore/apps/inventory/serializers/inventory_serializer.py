from rest_framework import serializers
from apps.inventory.models.inventory import Inventory
from apps.products.models.variant import ProductVariant
from apps.products.serializers.product_serializer import ProductSerializer, ProductVariantSerializer
from apps.stores.serializers.store_serializer import StoreSerializer
from apps.users.serializers.user_serializer import UserSerializer

class InventorySerializer(serializers.ModelSerializer):
    product_variant = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all(), write_only=True, required=False
    )
    product = ProductSerializer(source='product_variant.product', read_only=True)
    variant = ProductVariantSerializer(source='product_variant', read_only=True)
    store_details = StoreSerializer(source='store', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    updated_by_details = UserSerializer(source='updated_by', read_only=True)
    
    def validate(self, attrs):
        # Khi tạo mới, product_variant là bắt buộc
        if self.instance is None and not attrs.get('product_variant'):
            raise serializers.ValidationError({'product_variant': 'This field is required.'})
        return attrs

    class Meta:
        model = Inventory
        fields = [
            'id', 'product_variant', 'product', 'variant', 'store', 'store_details',
            'quantity', 'last_updated', 'created_by', 'created_by_details',
            'updated_by', 'updated_by_details', 'created_at', 'updated_at'
        ]
        read_only_fields = (
            'created_at', 'updated_at', 'last_updated',
            'product', 'variant', 'store_details', 'created_by_details', 'updated_by_details'
        ) 