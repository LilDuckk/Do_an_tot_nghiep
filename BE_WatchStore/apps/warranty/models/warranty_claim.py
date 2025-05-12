from django.db import models
from apps.core.models.base import BaseModel
from apps.users.models.user import UserAccount
from apps.warranty.models.warranty import Warranty
from apps.stores.models.employee import Employee

class WarrantyClaim(BaseModel):
    warranty = models.ForeignKey(Warranty, models.DO_NOTHING, blank=True, null=True)
    claim_date = models.DateField()
    description = models.TextField()
    resolution = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    completed_date = models.DateField(blank=True, null=True)
    technician = models.ForeignKey(Employee, models.DO_NOTHING, blank=True, null=True)
    repair_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='warrantyclaim_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'warrantyclaim'