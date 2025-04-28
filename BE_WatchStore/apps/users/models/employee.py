from django.db import models
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel
from apps.stores.models import Store

class Employee(BaseModel):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='employee', blank=True, null=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    employee_code = models.CharField(unique=True, max_length=50, blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    hire_date = models.DateField(blank=True, null=True)
    store = models.ForeignKey(Store, models.DO_NOTHING, related_name='employees', blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='employees_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='employees_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'employee' 