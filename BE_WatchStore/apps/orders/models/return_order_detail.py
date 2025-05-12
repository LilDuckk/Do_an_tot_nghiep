from django.db import models
from apps.core.models.base import BaseModel
from apps.orders.models.return_order import ReturnOrder
from apps.orders.models.order_detail import OrderDetail
from apps.products.models.variant import ProductVariant

class ReturnOrderDetail(BaseModel):
    return_order = models.ForeignKey(ReturnOrder, models.DO_NOTHING, blank=True, null=True)
    order_detail = models.ForeignKey(OrderDetail, models.DO_NOTHING, blank=True, null=True)
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, blank=True, null=True)
    quantity = models.IntegerField()
    reason = models.TextField(blank=True, null=True)
    condition = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'returnorderdetail' 