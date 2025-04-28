from django.db import models
from apps.core.models.base import BaseModel

class FooterCategory(BaseModel):
    name = models.CharField(max_length=100)
    display_order = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    created_by = models.ForeignKey('UserAccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('UserAccount', models.DO_NOTHING, db_column='updated_by', related_name='footercategory_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'footercategory'

class FooterLink(BaseModel):
    category = models.ForeignKey(FooterCategory, models.DO_NOTHING, blank=True, null=True)
    title = models.CharField(max_length=255)
    url = models.CharField(max_length=255)
    display_order = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    created_by = models.ForeignKey('UserAccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('UserAccount', models.DO_NOTHING, db_column='updated_by', related_name='footerlink_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'footerlink' 