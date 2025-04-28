from django.db import models
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel

class FooterCategory(BaseModel):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='footer_categories_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='footer_categories_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'footercategory'

class FooterLink(BaseModel):
    id = models.AutoField(primary_key=True)
    category = models.ForeignKey(FooterCategory, models.DO_NOTHING, related_name='links')
    title = models.CharField(max_length=255)
    url = models.CharField(max_length=255)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='footer_links_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='footer_links_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'footerlink' 