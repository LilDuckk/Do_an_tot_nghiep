from rest_framework import serializers
from apps.products.models.product_image import ProductImage
from apps.products.models.product import Product
from apps.products.models.variant import ProductVariant
from apps.core.serializers.base_serializer import BaseSerializer

class ProductImageSerializer(BaseSerializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), 
        required=False, 
        write_only=True
    )
    product_variant_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.all(), 
        required=False, 
        write_only=True
    )
    image_url = serializers.SerializerMethodField()

    class Meta(BaseSerializer.Meta):
        model = ProductImage
        fields = BaseSerializer.Meta.fields + [
            'product_id', 
            'product_variant_id', 
            'image', 
            'image_url', 
            'is_primary', 
            'alt_text', 
            'display_order'
        ]
        extra_kwargs = {
            'image': {'required': True}
        }

    def get_image_url(self, obj):
        """Return the URL of the uploaded image."""
        return obj.image.url if obj.image else None

    def create(self, validated_data):
        """Custom create method to handle product or variant association."""
        product_id = validated_data.pop('product_id', None)
        product_variant_id = validated_data.pop('product_variant_id', None)

        if not product_id and not product_variant_id:
            raise serializers.ValidationError("Either product_id or product_variant_id must be provided.")

        if product_id:
            validated_data['product'] = product_id  # product_id đã là object Product
        if product_variant_id:
            validated_data['product_variant'] = product_variant_id  # product_variant_id đã là object ProductVariant

        return super().create(validated_data)

    def validate_image(self, value):
        """Validate image file."""
        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError("Image file too large. Maximum size is 5MB.")
        return value
