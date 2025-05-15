from rest_framework import serializers
from apps.products.models.variant import ProductVariant
from apps.products.models.product import Product
from apps.core.serializers.base_serializer import BaseSerializer
from apps.products.serializers.attribute_serializer import AttributeTypeSerializer

class ProductVariantSerializer(BaseSerializer):
    product = serializers.PrimaryKeyRelatedField(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )

    class Meta(BaseSerializer.Meta):
        model = ProductVariant
        fields = BaseSerializer.Meta.fields + [
            'product', 'product_id', 'sku', 'price_adjustment',
            'stock_alert_threshold', 'barcode', 'is_active'
        ]

class VariantSerializer(serializers.ModelSerializer):
    attributes = AttributeTypeSerializer(many=True, read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 'sku', 'price_adjustment', 
                 'stock_alert_threshold', 'attributes', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')
