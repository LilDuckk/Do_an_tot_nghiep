from django.db import models
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount
from apps.orders.models.customer import Customer
from apps.orders.models.order import Orders

class ReturnOrder(BaseModel):
    order = models.ForeignKey(Orders, models.DO_NOTHING, blank=True, null=True)
    customer = models.ForeignKey(Customer, models.DO_NOTHING, blank=True, null=True)
    return_date = models.DateTimeField(blank=True, null=True)
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    refund_amount = models.DecimalField(max_digits=25, decimal_places=2, blank=True, null=True)
    refund_method = models.CharField(max_length=50, blank=True, null=True)
    refund_status = models.CharField(max_length=50, blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='returnorder_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'returnorder' 