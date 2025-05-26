from django.db import models
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from django.core.validators import FileExtensionValidator
import os
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount
from apps.products.models.category import Category
from apps.products.models.brand import Brand
from apps.products.models.attribute import AttributeType

def product_image_upload_path(instance, filename):
    """Generate unique filename for product images."""
    # Get product or variant name for path
    base_name = instance.product.name if instance.product else \
                instance.product_variant.name if instance.product_variant else 'unknown'
    
    # Slugify the base name and add timestamp to ensure uniqueness
    slug_name = slugify(base_name)
    name, ext = os.path.splitext(filename)
    unique_filename = f"{slug_name}_{instance.id}{ext}"
    
    return f"products/{unique_filename}"

class ProductImage(BaseModel):
    product = models.ForeignKey('Product', models.DO_NOTHING, blank=True, null=True, related_name='images')
    image = models.FileField(
        upload_to=product_image_upload_path,
        validators=[FileExtensionValidator(['png', 'jpg', 'jpeg', 'gif', 'webp'])],
        max_length=255,
        null=True,  # Allow null values for existing records
        blank=True  # Allow blank in forms
    )
    is_primary = models.BooleanField(default=False)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    display_order = models.IntegerField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='productimage_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'productimage'
        
    def save(self, *args, **kwargs):
        # Ensure only one primary image per product/variant
        if self.is_primary:
            model_class = self.product if self.product else self.product_variant
            model_class.images.filter(is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)

class Product(BaseModel):
    def get_attributes(self):
        """
        Lấy các attribute types liên quan đến sản phẩm
        """
        from apps.products.models.attribute import AttributeType
        
        # Kiểm tra xem category có liên kết với product_type không
        if not self.category:
            return []
        
        # Thêm kiểm tra an toàn cho product_type
        try:
            return AttributeType.objects.filter(product_type=self.category.product_type)
        except AttributeError:
            # Nếu không có product_type, trả về danh sách rỗng
            return []

    def delete(self, *args, **kwargs):
        # Xóa tất cả các biến thể liên quan trước
        from apps.products.models.variant import ProductVariant
        ProductVariant.objects.filter(product=self).delete()
        # Xóa tất cả các ảnh liên quan
        self.images.all().delete()
        # Gọi phương thức delete của lớp cha
        super().delete(*args, **kwargs)

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, models.DO_NOTHING, blank=True, null=True)
    brand = models.ForeignKey(Brand, models.DO_NOTHING, blank=True, null=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    warranty_period = models.IntegerField(blank=True, null=True)
    slug = models.CharField(unique=True, max_length=255, blank=True, null=True)
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    default_variant = models.ForeignKey('ProductVariant', models.SET_NULL, blank=True, null=True, related_name='default_for_products')
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='product_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'product'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['slug']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_featured']),
        ]

    def clean(self):
        if self.base_price < 0:
            raise ValidationError({'base_price': 'Base price cannot be negative'})
        if self.warranty_period and self.warranty_period < 0:
            raise ValidationError({'warranty_period': 'Warranty period cannot be negative'})
        if self.default_variant and self.default_variant.product != self:
            raise ValidationError({'default_variant': 'Default variant must belong to this product'})
