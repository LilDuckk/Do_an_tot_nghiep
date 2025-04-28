from django.db import models
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel
from .product import Product
from .attribute import AttributeValue

class ProductVariant(BaseModel):
    id = models.AutoField(primary_key=True)
    product = models.ForeignKey(Product, models.DO_NOTHING, related_name='variants')
    sku = models.CharField(unique=True, max_length=100)
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_alert_threshold = models.IntegerField(blank=True, null=True)
    barcode = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='product_variants_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='product_variants_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'productvariant'

class ProductVariantAttribute(BaseModel):
    id = models.AutoField(primary_key=True)
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, related_name='attributes')
    attribute_value = models.ForeignKey(AttributeValue, models.DO_NOTHING, related_name='product_variants')

    class Meta:
        managed = False
        db_table = 'productvariantattribute'
        unique_together = (('product_variant', 'attribute_value'),) 