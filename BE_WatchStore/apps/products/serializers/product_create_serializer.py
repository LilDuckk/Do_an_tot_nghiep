from rest_framework import serializers
from apps.products.models.product import Product
from apps.products.models.product_image import ProductImage
from apps.products.serializers.product_serializer import ProductSerializer
from apps.products.serializers.product_image_serializer import ProductImageSerializer
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError

class ProductCreateSerializer(serializers.Serializer):
    # Product fields
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Product.category.field.related_model.objects.all(), required=False)
    brand = serializers.PrimaryKeyRelatedField(queryset=Product.brand.field.related_model.objects.all(), required=False)
    base_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    warranty_period = serializers.IntegerField(required=False)
    slug = serializers.CharField(max_length=255, required=False, allow_blank=True)
    meta_title = serializers.CharField(max_length=255, required=False, allow_blank=True)
    meta_description = serializers.CharField(required=False, allow_blank=True)
    is_featured = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField(required=False)

    # Product images
    images = serializers.ListField(
        child=serializers.FileField(),
        required=False
    )
    primary_image_index = serializers.IntegerField(required=False, min_value=0)

    def validate_slug(self, value):
        if not value:
            return value
            
        # Kiểm tra slug đã tồn tại chưa
        if Product.objects.filter(slug=value).exists():
            if self.instance and self.instance.slug == value:
                return value
            raise ValidationError("Slug này đã tồn tại. Vui lòng chọn slug khác.")
        return value

    def create(self, validated_data):
        try:
            # Extract images data
            images = validated_data.pop('images', [])
            primary_image_index = validated_data.pop('primary_image_index', 0)

            # Create product
            product = Product.objects.create(**validated_data)

            # Create product images
            for index, image in enumerate(images):
                is_primary = index == primary_image_index
                ProductImage.objects.create(
                    product=product,
                    image=image,
                    is_primary=is_primary
                )

            return product
        except IntegrityError as e:
            if 'product_slug_key' in str(e):
                raise ValidationError({"slug": "Slug này đã tồn tại. Vui lòng chọn slug khác."})
            raise ValidationError({"detail": str(e)})
        except Exception as e:
            raise ValidationError({"detail": str(e)})

    def update(self, instance, validated_data):
        try:
            # Extract images data
            images = validated_data.pop('images', [])
            primary_image_index = validated_data.pop('primary_image_index', None)

            # Update product fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            # Handle images if provided
            if images:
                # Delete existing images if new ones are provided
                instance.images.all().delete()
                
                # Create new images
                for index, image in enumerate(images):
                    is_primary = index == primary_image_index if primary_image_index is not None else False
                    ProductImage.objects.create(
                        product=instance,
                        image=image,
                        is_primary=is_primary
                    )

            return instance
        except IntegrityError as e:
            if 'product_slug_key' in str(e):
                raise ValidationError({"slug": "Slug này đã tồn tại. Vui lòng chọn slug khác."})
            raise ValidationError({"detail": str(e)})
        except Exception as e:
            raise ValidationError({"detail": str(e)})

    def to_representation(self, instance):
        # Return product with its images
        product_data = ProductSerializer(instance).data
        images = ProductImage.objects.filter(product=instance)
        product_data['images'] = ProductImageSerializer(images, many=True).data
        return product_data 