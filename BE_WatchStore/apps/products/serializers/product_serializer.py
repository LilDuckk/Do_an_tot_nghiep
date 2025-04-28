from rest_framework import serializers
from apps.products.models.product import Product
from apps.products.serializers.category_serializer import CategorySerializer
from apps.products.serializers.brand_serializer import BrandSerializer

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    variants = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'category', 'brand',
                 'price', 'sale_price', 'stock', 'variants', 'images',
                 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')

    def get_variants(self, obj):
        from apps.products.serializers.variant_serializer import VariantSerializer  # import tại đây!
        variants = obj.variants.all()
        return VariantSerializer(variants, many=True, read_only=True).data
