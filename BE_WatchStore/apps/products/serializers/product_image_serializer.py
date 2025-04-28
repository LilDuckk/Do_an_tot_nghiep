from rest_framework import serializers
from apps.products.models.product_image import ProductImage
from apps.products.serializers.product_serializer import ProductSerializer
from apps.products.serializers.variant_serializer import ProductVariantSerializer
from apps.core.serializers.base_serializer import BaseSerializer

class ProductImageSerializer(BaseSerializer):
    product = ProductSerializer(read_only=True)
    product_variant = ProductVariantSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductImage.objects.all(),
        source='product',
        write_only=True
    )
    product_variant_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductImage.objects.all(),
        source='product_variant',
        write_only=True
    )

    class Meta(BaseSerializer.Meta):
        model = ProductImage
        fields = BaseSerializer.Meta.fields + [
            'product', 'product_id', 'product_variant',
            'product_variant_id', 'image_url', 'is_primary',
            'alt_text', 'display_order'
        ] 