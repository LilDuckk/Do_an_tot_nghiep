from django.db import models
from apps.core.models.base import BaseModel

class ProductVariant(BaseModel):
    product = models.ForeignKey('Product', models.DO_NOTHING, blank=True, null=True)
    sku = models.CharField(unique=True, max_length=100)
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    stock_alert_threshold = models.IntegerField(blank=True, null=True)
    barcode = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    created_by = models.ForeignKey('UserAccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('UserAccount', models.DO_NOTHING, db_column='updated_by', related_name='productvariant_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'productvariant'

class ProductVariantAttribute(BaseModel):
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, blank=True, null=True)
    attribute_value = models.ForeignKey('AttributeValue', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'productvariantattribute'
        unique_together = (('product_variant', 'attribute_value'),) 