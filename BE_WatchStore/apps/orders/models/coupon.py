from django.db import models
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount

class Coupon(BaseModel):
    code = models.CharField(unique=True, max_length=50)
    description = models.TextField(blank=True, null=True)
    discount_type = models.CharField(max_length=20, blank=True, null=True)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    starts_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    usage_limit = models.IntegerField(blank=True, null=True)
    usage_count = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='coupon_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'coupon' 