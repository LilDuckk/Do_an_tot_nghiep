from django.db import models
from apps.core.models.base import BaseModel

class Employee(BaseModel):
    user = models.ForeignKey('users.UserAccount', models.DO_NOTHING, blank=True, null=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    employee_code = models.CharField(unique=True, max_length=50, blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    hire_date = models.DateField(blank=True, null=True)
    store = models.ForeignKey('Store', models.DO_NOTHING, blank=True, null=True, related_name='employees')

    class Meta:
        managed = False
        db_table = 'employee' 