from django.db import models
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount

class Banner(BaseModel):
    title = models.CharField(max_length=255)
    image_url = models.CharField(max_length=255)
    link_url = models.CharField(max_length=255, blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    display_order = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    banner_location = models.CharField(max_length=50)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='banner_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'banner' 