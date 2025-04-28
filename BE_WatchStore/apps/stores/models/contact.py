from django.db import models
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel

class ContactInfo(BaseModel):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='contacts_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='contacts_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'contactinfo' 