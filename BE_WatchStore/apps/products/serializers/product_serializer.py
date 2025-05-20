from rest_framework import serializers
from apps.products.models.product import Product
from apps.products.models.variant import ProductVariant, ProductVariantAttribute
from apps.products.models.attribute import AttributeValue, AttributeValuePriceAdjustment
from apps.core.serializers.base_serializer import BaseSerializer
from apps.products.serializers.attribute_serializer import AttributeTypeSerializer
from apps.products.serializers.category_serializer import CategorySerializer
from apps.products.serializers.brand_serializer import BrandSerializer
from apps.products.serializers.product_image_serializer import ProductImageSerializer
import json

class ProductVariantAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariantAttribute
        fields = ['id', 'attribute_value', 'required']

class ProductVariantSerializer(BaseSerializer):
    attributes = ProductVariantAttributeSerializer(many=True, required=False)
    product = serializers.PrimaryKeyRelatedField(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )
    sku = serializers.CharField(read_only=True)
    
    class Meta(BaseSerializer.Meta):
        model = ProductVariant
        fields = BaseSerializer.Meta.fields + [
            'product', 'product_id', 'sku', 'price_adjustment',
            'stock_alert_threshold', 'barcode', 'is_active', 'attributes'
        ]

    def create(self, validated_data):
        attributes_data = validated_data.pop('attributes', [])
        variant = ProductVariant.objects.create(**validated_data)
        
        for attr_data in attributes_data:
            price_adjustment = attr_data.pop('price_adjustment', None)
            # Lấy instance AttributeValue từ ID nếu cần
            attr_value_id = attr_data.get('attribute_value')
            if isinstance(attr_value_id, int):
                attr_data['attribute_value'] = AttributeValue.objects.get(pk=attr_value_id)
            pva = ProductVariantAttribute.objects.create(product_variant=variant, **attr_data)
            # Lưu price_adjustment nếu có
            if price_adjustment is not None:
                AttributeValuePriceAdjustment.objects.update_or_create(
                    product=variant.product,
                    attribute_value=pva.attribute_value,
                    defaults={'price_adjustment': price_adjustment}
                )
            
        # Tạo SKU sau khi đã tạo variant và attributes
        variant.sku = variant.generate_sku()
        variant.save()
            
        return variant

    def update(self, instance, validated_data):
        print('DEBUG validated_data:', validated_data)
        print('DEBUG raw data:', self.initial_data)
        attributes_data = validated_data.pop('attributes', None)
        
        # Update variant fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update attributes if provided
        if attributes_data is not None:
            instance.attributes.all().delete()
            for attr_data in attributes_data:
                price_adjustment = attr_data.pop('price_adjustment', None)
                # Lấy instance AttributeValue từ ID nếu cần
                attr_value_id = attr_data.get('attribute_value')
                if isinstance(attr_value_id, int):
                    attr_data['attribute_value'] = AttributeValue.objects.get(pk=attr_value_id)
                pva = ProductVariantAttribute.objects.create(product_variant=instance, **attr_data)
                # Lưu price_adjustment nếu có
                if price_adjustment is not None:
                    AttributeValuePriceAdjustment.objects.update_or_create(
                        product=instance.product,
                        attribute_value=pva.attribute_value,
                        defaults={'price_adjustment': price_adjustment}
                    )
            
            # Cập nhật SKU sau khi cập nhật attributes
            instance.sku = instance.generate_sku()
            instance.save()
                
        return instance

class ProductDetailSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    attributes = serializers.SerializerMethodField()
    category_detail = CategorySerializer(source='category', read_only=True)
    brand_detail = BrandSerializer(source='brand', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    
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
        Lấy các attributes của sản phẩm
        """
        return AttributeTypeSerializer(obj.get_attributes(), many=True).data

class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    variants_input = serializers.JSONField(write_only=True, required=False)
    category_detail = CategorySerializer(source='category', read_only=True)
    brand_detail = BrandSerializer(source='brand', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'category', 'category_detail',
            'brand', 'brand_detail', 'base_price', 'warranty_period',
            'slug', 'meta_title', 'meta_description', 'is_featured',
            'is_active', 'default_variant', 'variants', 'images',
            'variants_input'
        ]
        extra_kwargs = {
            'id': {'read_only': True},
            'slug': {'read_only': True}
        }

    def to_internal_value(self, data):
        # Parse variants nếu là string hoặc list chứa string
        if 'variants' in data:
            variants_val = data['variants']
            if isinstance(variants_val, list):
                variants_val = variants_val[0]
            if isinstance(variants_val, str):
                try:
                    data['variants'] = json.loads(variants_val)
                except Exception:
                    pass
        if 'variants_data' in data:
            variants_data_val = data['variants_data']
            if isinstance(variants_data_val, list):
                variants_data_val = variants_data_val[0]
            if isinstance(variants_data_val, str):
                try:
                    data['variants_data'] = json.loads(variants_data_val)
                except Exception:
                    pass
        return super().to_internal_value(data)

    def create(self, validated_data):
        variants_data = validated_data.pop('variants_input', None)
        # Hỗ trợ nhận cả 'variants' (array) hoặc 'variants_data' (string)
        if not variants_data:
            variants_data = validated_data.pop('variants_data', [])
            if isinstance(variants_data, str):
                import json
                variants_data = json.loads(variants_data)
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
        
        # Tạo variants nếu có
        for variant_data in variants_data:
            print('DEBUG variant_data:', variant_data)
            attributes_data = variant_data.pop('attributes', [])
            variant = ProductVariant.objects.create(product=product, **variant_data)
            
            for attr_data in attributes_data:
                print('DEBUG attr_data:', attr_data)
                price_adjustment = attr_data.pop('price_adjustment', None)
                # Lấy instance AttributeValue từ ID nếu cần
                attr_value_id = attr_data.get('attribute_value')
                if isinstance(attr_value_id, int):
                    from apps.products.models.attribute import AttributeValue
                    attr_data['attribute_value'] = AttributeValue.objects.get(pk=attr_value_id)
                pva = ProductVariantAttribute.objects.create(product_variant=variant, **attr_data)
                # Lưu price_adjustment nếu có
                if price_adjustment is not None:
                    AttributeValuePriceAdjustment.objects.update_or_create(
                        product=product,
                        attribute_value=pva.attribute_value,
                        defaults={'price_adjustment': price_adjustment}
                    )
        
        return product

    def update(self, instance, validated_data):
        print('DEBUG validated_data:', validated_data)
        print('DEBUG raw data:', self.initial_data)
        variants_data = validated_data.pop('variants_input', None)
        if not variants_data:
            variants_data = validated_data.pop('variants_data', None)
            if variants_data and isinstance(variants_data, str):
                import json
                variants_data = json.loads(variants_data)

        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Xóa toàn bộ variants cũ trước khi tạo mới
        if variants_data is not None:
            # Xóa hết ProductVariantAttribute liên quan đến các variant cũ
            from apps.products.models.variant import ProductVariantAttribute
            ProductVariantAttribute.objects.filter(product_variant__in=instance.variants.all()).delete()
            # Sau đó xóa variant cũ
            instance.variants.all().delete()
            for variant_data in variants_data:
                print('DEBUG variant_data:', variant_data)
                attributes_data = variant_data.pop('attributes', [])
                variant = ProductVariant.objects.create(product=instance, **variant_data)
                for attr_data in attributes_data:
                    print('DEBUG attr_data:', attr_data)
                    price_adjustment = attr_data.pop('price_adjustment', None)
                    attr_value_id = attr_data.get('attribute_value')
                    if isinstance(attr_value_id, int):
                        from apps.products.models.attribute import AttributeValue
                        attr_data['attribute_value'] = AttributeValue.objects.get(pk=attr_value_id)
                    pva = ProductVariantAttribute.objects.create(product_variant=variant, **attr_data)
                    if price_adjustment is not None:
                        AttributeValuePriceAdjustment.objects.update_or_create(
                            product=instance,
                            attribute_value=pva.attribute_value,
                            defaults={'price_adjustment': price_adjustment}
                        )
        return instance

    def get_variants(self, obj):
        # Lấy tất cả các variants của sản phẩm và serialize chúng
        return ProductVariantSerializer(obj.variants.all(), many=True).data
