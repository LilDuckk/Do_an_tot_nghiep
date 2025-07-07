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
    warranty_period = serializers.IntegerField(required=False, allow_null=True, help_text="Thời gian bảo hành theo tháng. Nếu để trống sẽ lấy từ product")
    effective_warranty_period = serializers.SerializerMethodField(help_text="Thời gian bảo hành hiệu lực (từ variant hoặc fallback về product)")
    
    class Meta(BaseSerializer.Meta):
        model = ProductVariant
        fields = BaseSerializer.Meta.fields + [
            'product', 'product_id', 'product_name', 'sku', 'price_adjustment',
            'stock_alert_threshold', 'barcode', 'is_active', 'attribute_values',
            'attribute_values_detail', 'images', 'warranty_period', 'effective_warranty_period'
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

    def get_effective_warranty_period(self, obj):
        """Lấy thời gian bảo hành hiệu lực"""
        return obj.get_warranty_period()

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
        from apps.products.services import ProductService

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
            # Sử dụng service để tạo product với variants
            if attr_value_objects:
                # Tạo variants data từ attribute combinations
                variants_data = []
                for combo in itertools.product(*attr_value_objects):
                    variant_data = {
                        'attribute_values': list(combo),
                        'is_active': True
                    }
                    variants_data.append(variant_data)
                
                product, created_variants = ProductService.create_product_with_variants(
                    validated_data, variants_data
                )
            else:
                # Tạo product không có variants
                product = Product.objects.create(**validated_data)

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
        from apps.inventory.models.inventory import Inventory
        from apps.products.models.variant import ProductVariant
        from apps.inventory.services import InventoryService
        import itertools
        attribute_value_groups = validated_data.pop('attribute_value_groups', None)

        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Nếu có attribute_value_groups mới, xử lý thông minh theo tồn kho
        if attribute_value_groups is not None and attribute_value_groups != []:
            # Nếu là list các list (mỗi list là 1 nhóm thuộc tính), sinh tất cả tổ hợp
            if all(isinstance(group, list) for group in attribute_value_groups):
                all_combinations = list(itertools.product(*attribute_value_groups))
                new_groups = [sorted(list(combo)) for combo in all_combinations]
            else:
                # Trường hợp cũ: mỗi group là 1 biến thể
                new_groups = [sorted(group) for group in attribute_value_groups]
            new_groups = sorted(new_groups)

            # Lấy các nhóm attribute_value hiện tại (dạng list các list id, đã sort)
            current_variants = list(instance.variants.filter(is_deleted=False))
            current_groups = [sorted([av.id for av in v.attribute_values.all()]) for v in current_variants]
            current_groups = sorted(current_groups)

            # 1. Kiểm tra các group cũ không còn trong group mới (cần xóa)
            to_delete = []
            cannot_delete = []
            for idx, group in enumerate(current_groups):
                if group not in new_groups:
                    variant = current_variants[idx]
                    inventory_exists = Inventory.objects.filter(product_variant=variant, is_deleted=False).exists()
                    if inventory_exists:
                        cannot_delete.append(variant.sku)
                    else:
                        to_delete.append(variant)
            if cannot_delete:
                raise serializers.ValidationError([
                    f"Không thể xóa các biến thể sau vì đang có tồn kho: {', '.join(cannot_delete)}. "
                    "Vui lòng xóa tồn kho hoặc thêm lại các giá trị thuộc tính này trước khi cập nhật."
                ])
            for variant in to_delete:
                variant.delete()

            # 2. Kiểm tra các group mới chưa từng có (cần tạo mới)
            for group in new_groups:
                if group not in current_groups:
                    attr_value_objects = [AttributeValue.objects.get(id=id) for id in group]
                    # Chuẩn bị dữ liệu mặc định cho variant mới
                    variant_data = {
                        'price_adjustment': None,
                        'warranty_period': instance.warranty_period,
                        'stock_alert_threshold': None,
                        'barcode': None,
                        'is_active': True,
                        'weight': None,
                        'dimensions': None,
                        'created_by': None,
                        'updated_by': None,
                    }
                    # Tạo variant mới giống logic tạo sản phẩm
                    variant = ProductVariant.create_variant_with_attributes(
                        product=instance,
                        attribute_values=attr_value_objects,
                        **variant_data
                    )
                    # Tạo tồn kho cho tất cả các cửa hàng cho variant mới
                    InventoryService.create_inventory_for_variant(variant)

            # 3. Các group đã có thì giữ nguyên (không làm gì)

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
