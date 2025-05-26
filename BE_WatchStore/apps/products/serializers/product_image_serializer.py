from rest_framework import serializers
from apps.products.models.product import Product, ProductImage
from apps.core.serializers.base_serializer import BaseSerializer
from django.conf import settings

class ProductImageSerializer(BaseSerializer):
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), 
        required=False, 
        write_only=True
    )
    image_url = serializers.SerializerMethodField()

    class Meta(BaseSerializer.Meta):
        model = ProductImage
        fields = BaseSerializer.Meta.fields + [
            'product_id', 
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
        if obj.image:
            # Lấy đường dẫn đầy đủ của ảnh
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            # Nếu không có request, trả về đường dẫn với localhost
            return f"http://localhost:8000{obj.image.url}"
        return None

    def create(self, validated_data):
        """Custom create method to handle product association."""
        product_id = validated_data.pop('product_id', None)
        if not product_id:
            raise serializers.ValidationError("product_id must be provided.")
        validated_data['product'] = product_id
        return super().create(validated_data)

    def validate_image(self, value):
        """Validate image file."""
        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError("Image file too large. Maximum size is 5MB.")
        return value
