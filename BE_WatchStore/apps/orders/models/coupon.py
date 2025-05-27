from django.db import models
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount
from django.utils import timezone

class Coupon(BaseModel):
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    discount_type = models.CharField(max_length=20, choices=[
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount')
    ])
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    start_date = models.DateTimeField()
    expires_at = models.DateTimeField()
    usage_limit = models.IntegerField(default=1)
    usage_count = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='coupon_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'coupon'

    def is_valid(self):
        now = timezone.now()
        return (
            self.is_active and
            self.start_date <= now <= self.expires_at and
            self.get_usage_count() < self.usage_limit
        )

    def get_usage_count(self):
        # Đếm số lần sử dụng coupon trong các order đã hoàn thành
        from apps.orders.models.order_detail import OrderDetail
        return OrderDetail.objects.filter(
            coupon=self,
            order__status='completed'
        ).count()

    def apply_discount(self, amount):
        if not self.is_valid():
            return amount
        
        if self.discount_type == 'percentage':
            discount = (amount * self.discount_value) / 100
        else:  # fixed amount
            discount = self.discount_value
        
        return max(0, amount - discount) 