from django.db import models
from apps.core.models.base import BaseModel
from apps.users.models.user import UserAccount

class ContactInfo(BaseModel):
    company_name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    working_hours = models.TextField(blank=True, null=True)
    facebook_url = models.CharField(max_length=255, blank=True, null=True)
    instagram_url = models.CharField(max_length=255, blank=True, null=True)
    youtube_url = models.CharField(max_length=255, blank=True, null=True)
    tiktok_url = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='contactinfo_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'contactinfo' 