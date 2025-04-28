from django.db import models
from apps.users.models import UserAccount
from apps.core.models.base import BaseModel

class NewsCategory(BaseModel):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    slug = models.CharField(unique=True, max_length=150)
    description = models.TextField(blank=True, null=True)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='news_categories_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='news_categories_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'newscategory'

class News(BaseModel):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    slug = models.CharField(unique=True, max_length=255)
    content = models.TextField(blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    category = models.ForeignKey(NewsCategory, models.DO_NOTHING, related_name='news', blank=True, null=True)
    featured_image = models.CharField(max_length=255, blank=True, null=True)
    is_published = models.BooleanField(default=False)
    publish_date = models.DateTimeField(blank=True, null=True)
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    view_count = models.IntegerField(default=0)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='news_created', db_column='created_by')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, related_name='news_updated', db_column='updated_by')

    class Meta:
        managed = False
        db_table = 'news' 