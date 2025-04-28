from django.db import models
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount
from .store import Store

class Employee(BaseModel):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(UserAccount, models.DO_NOTHING, related_name='employee')
    store = models.ForeignKey(Store, models.DO_NOTHING, related_name='employees')
    position = models.CharField(max_length=50)
    hire_date = models.DateField()
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='employees_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='employees_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'employee' 