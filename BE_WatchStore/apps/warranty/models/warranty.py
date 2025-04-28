from django.db import models
from apps.users.models import UserAccount
from apps.orders.models import OrderDetail
from apps.stores.models.employee import Employee

class Warranty(models.Model):
    order_detail = models.ForeignKey(OrderDetail, models.DO_NOTHING, blank=True, null=True)
    warranty_start_date = models.DateField()
    warranty_end_date = models.DateField()
    serial_number = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='warranty_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'warranty'

class WarrantyClaim(models.Model):
    warranty = models.ForeignKey(Warranty, models.DO_NOTHING, blank=True, null=True)
    claim_date = models.DateField()
    description = models.TextField()
    resolution = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    completed_date = models.DateField(blank=True, null=True)
    technician = models.ForeignKey(Employee, models.DO_NOTHING, blank=True, null=True)
    repair_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='warrantyclaim_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'warrantyclaim' 