from django.db import models
from apps.core.models.base import BaseModel
from .user import UserAccount

class Customer(BaseModel):
    id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    user = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='customer', blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='customers_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='customers_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'customer' 