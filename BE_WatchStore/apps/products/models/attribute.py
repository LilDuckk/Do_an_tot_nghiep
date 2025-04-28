from django.db import models
from apps.core.models.base import BaseModel
from .product import ProductVariant

class AttributeType(BaseModel):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'attributetype'

class AttributeValue(BaseModel):
    id = models.AutoField(primary_key=True)
    attribute_type = models.ForeignKey(AttributeType, models.DO_NOTHING, related_name='values')
    value = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'attributevalue'

class ProductVariantAttribute(BaseModel):
    id = models.AutoField(primary_key=True)
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, related_name='attributes')
    attribute_value = models.ForeignKey(AttributeValue, models.DO_NOTHING, related_name='product_variants')

    class Meta:
        managed = False
        db_table = 'productvariantattribute'
        unique_together = (('product_variant', 'attribute_value'),) 