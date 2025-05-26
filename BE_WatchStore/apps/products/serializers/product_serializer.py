from rest_framework import serializers
from django.db import transaction
import itertools
import uuid
from apps.products.models.product import Product
from apps.products.models.variant import ProductVariant, VariantImage
from apps.products.models.attribute import AttributeValue, AttributeType
from apps.core.serializers.base_serializer import BaseSerializer
from apps.products.serializers.attribute_serializer import AttributeTypeSerializer
from apps.products.serializers.category_serializer import CategorySerializer
from apps.products.serializers.brand_serializer import BrandSerializer
from apps.products.serializers.product_image_serializer import ProductImageSerializer
from apps.products.utils import convert_to_png
import json
import ast
from rest_framework.reverse import reverse

class VariantImageSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = VariantImage
        fields = BaseSerializer.Meta.fields + ['variant', 'image', 'alt_text']

class ProductVariantSerializer(BaseSerializer):
    attribute_values = serializers.PrimaryKeyRelatedField(
        queryset=AttributeValue.objects.all(),
        many=True,
        required=False
    )
    product = serializers.PrimaryKeyRelatedField(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )
    product_name = serializers.CharField(source='product.name', read_only=True)
    attribute_values_detail = serializers.SerializerMethodField()
    sku = serializers.CharField(read_only=True)
    images = VariantImageSerializer(many=True, read_only=True)
    
    class Meta(BaseSerializer.Meta):
        model = ProductVariant
        fields = BaseSerializer.Meta.fields + [
            'product', 'product_id', 'product_name', 'sku', 'price_adjustment',
            'stock_alert_threshold', 'barcode', 'is_active', 'attribute_values',
            'attribute_values_detail', 'images'
        ]

    def get_attribute_values_detail(self, obj):
        values = obj.attribute_values.select_related('attribute_type').all()
        return [
            {
                'id': value.id,
                'value': value.value,
                'attribute_type': {
                    'id': value.attribute_type.id,
                    'name': value.attribute_type.name
                }
            }
            for value in values
        ]

    def create(self, validated_data):
        # Extract attribute values if present
        attribute_values = validated_data.pop('attribute_values', [])
        
        # Create variant without attribute values
        variant = ProductVariant.objects.create(**validated_data)
        
        # Set attribute values after creation
        if attribute_values:
            variant.attribute_values.set(attribute_values)
        
        return variant

    def update(self, instance, validated_data):
        attribute_values = validated_data.pop('attribute_values', None)
        
        # Update variant fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update attribute values if provided
        if attribute_values is not None:
            instance.attribute_values.set(attribute_values)
        
        instance.save()
        return instance

class ProductDetailSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    attributes = serializers.SerializerMethodField()
    category_detail = CategorySerializer(source='category', read_only=True)
    brand_detail = BrandSerializer(source='brand', read_only=True)
    images = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'category', 'category_detail',
                 'brand', 'brand_detail', 'base_price', 'warranty_period',
                 'slug', 'meta_title', 'meta_description', 'is_featured',
                 'is_active', 'default_variant', 'variants', 'attributes',
                 'created_at', 'updated_at', 'images']
        read_only_fields = ('created_at', 'updated_at', 'slug')

    def get_attributes(self, obj):
        """
        Lấy các attributes và values của sản phẩm
        """
        # Lấy tất cả variants của sản phẩm
        variants = obj.variants.filter(is_deleted=False)
        
        # Lấy tất cả attribute values từ các variants
        attribute_values = AttributeValue.objects.filter(
            variants__in=variants,
            is_deleted=False
        ).distinct()
        
        # Nhóm các values theo attribute type
        result = []
        for attr_type in attribute_values.values_list('attribute_type', flat=True).distinct():
            attr = AttributeType.objects.get(id=attr_type)
            values = attribute_values.filter(attribute_type=attr)
            
            attr_data = {
                'id': attr.id,
                'name': attr.name,
                'description': attr.description,
                'values': [
                    {
                        'id': value.id,
                        'value': value.value
                    }
                    for value in values
                ]
            }
            result.append(attr_data)
            
        return result

    def get_images(self, obj):
        images_qs = obj.images.filter(is_deleted=False)
        return ProductImageSerializer(images_qs, many=True).data

class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    attribute_value_groups = serializers.JSONField(write_only=True, required=False)
    category_detail = CategorySerializer(source='category', read_only=True)
    brand_detail = BrandSerializer(source='brand', read_only=True)
    images = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'category', 'category_detail',
            'brand', 'brand_detail', 'base_price', 'warranty_period',
            'slug', 'meta_title', 'meta_description', 'is_featured',
            'is_active', 'default_variant', 'variants', 'images',
            'attribute_value_groups'
        ]
        extra_kwargs = {
            'id': {'read_only': True},
            'slug': {'read_only': True}
        }

    def validate_attribute_value_groups(self, value):
        print("DEBUG validate_attribute_value_groups input:", value)
        # Validate attribute_value_groups with robust parsing
        if isinstance(value, str):
            try:
                # Try multiple parsing methods
                try:
                    # First, try standard JSON parsing
                    groups = json.loads(value)
                except json.JSONDecodeError:
                    try:
                        # If JSON fails, try literal evaluation
                        groups = ast.literal_eval(value)
                    except (ValueError, SyntaxError):
                        # If both fail, try removing extra quotes
                        groups = json.loads(value.replace("'", '"'))
                
                # Validate and convert to list of lists of integers
                if not isinstance(groups, list):
                    raise serializers.ValidationError('Expected a list of lists of integers.')
                
                # Ensure each group is a list of integers
                validated_groups = []
                for group in groups:
                    validated_group = []
                    for item in group:
                        try:
                            validated_group.append(int(item))
                        except (ValueError, TypeError):
                            raise serializers.ValidationError('All items must be valid integers.')
                    validated_groups.append(validated_group)
                
                return validated_groups
            except Exception:
                raise serializers.ValidationError('Invalid format. Expected list of lists of integers.')
        
        # If already a list, validate and convert
        if isinstance(value, list):
            validated_groups = []
            for group in value:
                validated_group = []
                for item in group:
                    try:
                        validated_group.append(int(item))
                    except (ValueError, TypeError):
                        raise serializers.ValidationError('All items must be valid integers.')
                validated_groups.append(validated_group)
            return validated_groups
        
        raise serializers.ValidationError('Invalid format. Expected list of lists of integers.')

    def to_internal_value(self, data):
        print("DEBUG to_internal_value input:", data.get('attribute_value_groups'))
        # Tạo một bản sao của data để tránh thay đổi trực tiếp
        mutable_data = data.copy() if isinstance(data, dict) else {}
        
        # Check if attribute_value_groups is in request.data
        attribute_value_groups = self.context['request'].data.get('attribute_value_groups', None)
        
        if attribute_value_groups:
            try:
                # Try parsing the attribute_value_groups
                parsed_groups = json.loads(attribute_value_groups)
                
                # Validate and convert to list of lists of integers
                validated_groups = []
                for group in parsed_groups:
                    validated_group = []
                    for item in group:
                        try:
                            validated_group.append(int(item))
                        except (ValueError, TypeError):
                            raise serializers.ValidationError({
                                'attribute_value_groups': ['All items must be valid integers.']
                            })
                    validated_groups.append(validated_group)
                
                mutable_data['attribute_value_groups'] = validated_groups
            except json.JSONDecodeError:
                raise serializers.ValidationError({
                    'attribute_value_groups': ['Invalid JSON format.']
                })
        
        return super().to_internal_value(mutable_data)

    def create(self, validated_data):
        from apps.products.models.product import ProductImage

        images = self.context['request'].FILES.getlist('images')
        primary_image_index = int(self.context['request'].data.get('primary_image_index', 0))
        attribute_value_groups = validated_data.pop('attribute_value_groups', [])

        # Validate và lấy attr_value_objects TRƯỚC khi vào transaction.atomic
        attr_value_objects = []
        if attribute_value_groups:
            try:
                attr_value_objects = [
                    [AttributeValue.objects.get(id=id) for id in group]
                    for group in attribute_value_groups
                ]
            except AttributeValue.DoesNotExist:
                raise serializers.ValidationError("Một hoặc nhiều AttributeValue không tồn tại.")

        # Tạo product và các đối tượng liên quan trong block atomic
        with transaction.atomic():
            product = Product.objects.create(**validated_data)

            # Tạo tổ hợp tất cả biến thể
            if attr_value_objects:
                for combo in itertools.product(*attr_value_objects):
                    # Tạo variant trước
                    variant = ProductVariant.objects.create(product=product)
                    # Set attribute values sau
                    variant.attribute_values.set(combo)
                    # Generate SKU với attribute values
                    variant.sku = variant.generate_sku(attribute_values_list=[av.value for av in combo])
                    variant.save()

            # Tạo ảnh sản phẩm
            for idx, image_file in enumerate(images):
                # Chuyển đổi ảnh sang PNG
                png_image = convert_to_png(image_file)
                ProductImage.objects.create(
                    product=product,
                    image=png_image,
                    is_primary=(idx == primary_image_index)
                )

        return product

    @transaction.atomic
    def update(self, instance, validated_data):
        from apps.products.models.product import ProductImage
        attribute_value_groups = validated_data.pop('attribute_value_groups', None)

        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Nếu có attribute_value_groups mới, xóa variants cũ và tạo mới
        if attribute_value_groups is not None:
            # Xóa variants cũ
            instance.variants.all().delete()
            # Chuyển đổi các ID thành các AttributeValue objects
            attr_value_objects = [
                [AttributeValue.objects.get(id=id) for id in group]
                for group in attribute_value_groups
            ]
            # Tạo tổ hợp tất cả biến thể
            for combo in itertools.product(*attr_value_objects):
                combo_ids = [av.id for av in combo]
                variant = ProductVariant.objects.create(product=instance)
                variant.attribute_values.set(combo_ids)

        # XỬ LÝ ẢNH MỚI (nếu có)
        images = self.context['request'].FILES.getlist('images')
        primary_image_index = int(self.context['request'].data.get('primary_image_index', 0))
        if images:
            # Nếu muốn xóa hết ảnh cũ, bỏ comment dòng dưới
            # instance.images.all().delete()
            for idx, image_file in enumerate(images):
                # Chuyển đổi ảnh sang PNG
                png_image = convert_to_png(image_file)
                ProductImage.objects.create(
                    product=instance,
                    image=png_image,
                    is_primary=(idx == primary_image_index)
                )

        return instance

    def get_variants(self, obj):
        # Lấy tất cả các variants của sản phẩm và serialize chúng
        return ProductVariantSerializer(obj.variants.all(), many=True).data

    def get_images(self, obj):
        images_qs = obj.images.filter(is_deleted=False)
        return ProductImageSerializer(images_qs, many=True, context=self.context).data
