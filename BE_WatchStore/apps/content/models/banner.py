from django.db import models
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel

class Banner(BaseModel):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    image_url = models.CharField(max_length=255)
    link_url = models.CharField(max_length=255, blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    banner_location = models.CharField(max_length=50)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='banners_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='banners_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'banner' 