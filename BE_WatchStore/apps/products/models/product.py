from django.db import models
from django.core.exceptions import ValidationError
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount
from apps.products.models.category import Category
from apps.products.models.brand import Brand
from apps.products.models.attribute import AttributeType

class Product(BaseModel):
    # Thêm phương thức để lấy các attributes của sản phẩm
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
