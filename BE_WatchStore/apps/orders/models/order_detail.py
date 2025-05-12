from django.db import models
from apps.core.models.base import BaseModel
from apps.orders.models.order import Orders
from apps.products.models.variant import ProductVariant

class OrderDetail(BaseModel):
    order = models.ForeignKey(Orders, models.DO_NOTHING, blank=True, null=True)
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, blank=True, null=True)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'orderdetail' 