from django.db import models
from apps.core.models.base import BaseModel

class ReturnOrderDetail(BaseModel):
    return_order = models.ForeignKey('ReturnOrder', models.DO_NOTHING, blank=True, null=True)
    order_detail = models.ForeignKey('OrderDetail', models.DO_NOTHING, blank=True, null=True)
    product_variant = models.ForeignKey('ProductVariant', models.DO_NOTHING, blank=True, null=True)
    quantity = models.IntegerField()
    reason = models.TextField(blank=True, null=True)
    condition = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'returnorderdetail' 