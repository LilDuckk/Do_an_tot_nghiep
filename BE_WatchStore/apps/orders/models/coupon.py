from django.db import models
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel
from .order import Order

class Coupon(BaseModel):
    id = models.AutoField(primary_key=True)
    code = models.CharField(unique=True, max_length=50)
    description = models.TextField(blank=True, null=True)
    discount_type = models.CharField(max_length=20, blank=True, null=True)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    starts_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    usage_limit = models.IntegerField(blank=True, null=True)
    usage_count = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='coupons_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='coupons_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'coupon'

class OrderCoupon(BaseModel):
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, models.DO_NOTHING, related_name='coupons')
    coupon_code = models.CharField(max_length=50)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='order_coupons_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='order_coupons_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'ordercoupon' 