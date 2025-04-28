from rest_framework import serializers
from ..models import (
    Product, ProductVariant, ProductImage, 
    Brand, Category, AttributeType, AttributeValue, ProductVariantAttribute
)
from apps.users.serializers import UserSerializer

class BrandSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Brand
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Category
        fields = '__all__'

class AttributeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttributeType
        fields = '__all__'

class AttributeValueSerializer(serializers.ModelSerializer):
    attribute_type = AttributeTypeSerializer(read_only=True)
    
    class Meta:
        model = AttributeValue
        fields = '__all__'

class ProductVariantAttributeSerializer(serializers.ModelSerializer):
    attribute_value = AttributeValueSerializer(read_only=True)
    
    class Meta:
        model = ProductVariantAttribute
        fields = '__all__'

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = '__all__'

class ProductVariantSerializer(serializers.ModelSerializer):
    attributes = ProductVariantAttributeSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProductVariant
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    created_by = UserSerializer(read_only=True)
    updated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__' 