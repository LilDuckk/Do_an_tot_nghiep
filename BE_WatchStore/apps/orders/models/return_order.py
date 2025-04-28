from django.db import models
from apps.users.models import UserAccount, Customer
from apps.core.models.base import BaseModel
from .order import Order, OrderDetail
from apps.products.models import ProductVariant

class ReturnOrder(BaseModel):
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, models.DO_NOTHING, related_name='returns', blank=True, null=True)
    customer = models.ForeignKey(Customer, models.DO_NOTHING, related_name='returns', blank=True, null=True)
    return_date = models.DateTimeField(blank=True, null=True)
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    refund_method = models.CharField(max_length=50, blank=True, null=True)
    refund_status = models.CharField(max_length=50, blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='return_orders_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='return_orders_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'returnorder'

class ReturnOrderDetail(BaseModel):
    id = models.AutoField(primary_key=True)
    return_order = models.ForeignKey(ReturnOrder, models.DO_NOTHING, related_name='details')
    order_detail = models.ForeignKey(OrderDetail, models.DO_NOTHING, related_name='returns', blank=True, null=True)
    product_variant = models.ForeignKey(ProductVariant, models.DO_NOTHING, related_name='return_details')
    quantity = models.IntegerField()
    reason = models.TextField(blank=True, null=True)
    condition = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'returnorderdetail' 