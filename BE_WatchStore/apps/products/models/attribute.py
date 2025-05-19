from django.db import models
from apps.core.models.base import BaseModel

class AttributeType(BaseModel):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'attributetype'

class AttributeValue(BaseModel):
    attribute_type = models.ForeignKey(AttributeType, models.DO_NOTHING, blank=True, null=True)
    value = models.CharField(max_length=255)

    class Meta:
        managed = True
        db_table = 'attributevalue'

class AttributeValuePriceAdjustment(BaseModel):
    attribute_value = models.ForeignKey(AttributeValue, models.DO_NOTHING, related_name='price_adjustments')
    product = models.ForeignKey('Product', models.DO_NOTHING, related_name='attribute_price_adjustments')
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        managed = True
        db_table = 'attributevaluepriceadjustment'
        unique_together = ('attribute_value', 'product') 