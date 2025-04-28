from django.db import models
from apps.users.models import UserAccount, Employee
from apps.core.models.base import BaseModel
from .order import OrderDetail

class Warranty(BaseModel):
    id = models.AutoField(primary_key=True)
    order_detail = models.ForeignKey(OrderDetail, models.DO_NOTHING, related_name='warranties', blank=True, null=True)
    warranty_start_date = models.DateField()
    warranty_end_date = models.DateField()
    serial_number = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='warranties_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='warranties_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'warranty'

class WarrantyClaim(BaseModel):
    id = models.AutoField(primary_key=True)
    warranty = models.ForeignKey(Warranty, models.DO_NOTHING, related_name='claims', blank=True, null=True)
    claim_date = models.DateField()
    description = models.TextField()
    resolution = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    completed_date = models.DateField(blank=True, null=True)
    technician = models.ForeignKey(Employee, models.DO_NOTHING, related_name='warranty_claims', blank=True, null=True)
    repair_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='warranty_claims_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='warranty_claims_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'warrantyclaim' 