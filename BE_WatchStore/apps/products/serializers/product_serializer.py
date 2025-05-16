from rest_framework import serializers
from apps.products.models.product import Product
from apps.products.serializers.category_serializer import CategorySerializer
from apps.products.serializers.brand_serializer import BrandSerializer
from apps.products.serializers.product_image_serializer import ProductImageSerializer

class ProductSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    brand_detail = BrandSerializer(source='brand', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'category', 'category_detail',
            'brand', 'brand_detail', 'base_price', 'warranty_period',
            'slug', 'meta_title', 'meta_description', 'is_featured',
            'is_active', 'created_at', 'updated_at', 'images'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def to_internal_value(self, data):
        # Chuyển đổi category và brand từ object sang ID nếu cần
        if 'category' in data and isinstance(data['category'], dict):
            data['category'] = data['category'].get('id')
        if 'brand' in data and isinstance(data['brand'], dict):
            data['brand'] = data['brand'].get('id')
        return super().to_internal_value(data)

    def create(self, validated_data):
        # Lấy category và brand từ validated_data
        category = validated_data.pop('category', None)
        brand = validated_data.pop('brand', None)

        # Tạo product mới
        product = Product.objects.create(**validated_data)

        # Gán category và brand nếu có
        if category:
            product.category_id = category.id if hasattr(category, 'id') else category
        if brand:
            product.brand_id = brand.id if hasattr(brand, 'id') else brand

        product.save()
        return product
