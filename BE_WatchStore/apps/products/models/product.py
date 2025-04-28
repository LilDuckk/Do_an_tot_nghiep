from django.db import models
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel
from .brand import Brand
from .category import Category

class Product(BaseModel):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, models.DO_NOTHING, related_name='products', blank=True, null=True)
    brand = models.ForeignKey(Brand, models.DO_NOTHING, related_name='products', blank=True, null=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    warranty_period = models.IntegerField(blank=True, null=True)
    slug = models.CharField(unique=True, max_length=255)
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='products_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='products_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'product'

class ProductVariant(BaseModel):
    id = models.AutoField(primary_key=True)
    product = models.ForeignKey(Product, models.DO_NOTHING, related_name='variants')
    sku = models.CharField(unique=True, max_length=100)
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_alert_threshold = models.IntegerField(default=10)
    barcode = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='product_variants_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='product_variants_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'productvariant'

class ProductImage(BaseModel):
    id = models.AutoField(primary_key=True)
    product = models.ForeignKey(Product, models.DO_NOTHING, related_name='images', blank=True, null=True)
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, related_name='images', blank=True, null=True)
    image_url = models.CharField(max_length=255)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='product_images_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='product_images_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'productimage' 