from django.db import models
from apps.core.models.base import BaseModel

class Category(BaseModel):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    parent = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)
    display_order = models.IntegerField(blank=True, null=True)
    slug = models.CharField(unique=True, max_length=255, blank=True, null=True)
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    created_by = models.ForeignKey('UserAccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('UserAccount', models.DO_NOTHING, db_column='updated_by', related_name='category_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'category' 