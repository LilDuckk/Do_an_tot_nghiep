from django.db import models
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel
from .product import Product
from .product_variant import ProductVariant

class ProductImage(BaseModel):
    id = models.AutoField(primary_key=True)
    product = models.ForeignKey(Product, models.DO_NOTHING, related_name='images', blank=True, null=True)
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, related_name='images', blank=True, null=True)
    image_url = models.CharField(max_length=255)
    is_primary = models.BooleanField(default=False)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    display_order = models.IntegerField(default=0)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='product_images_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='product_images_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'productimage' 