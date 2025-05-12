from django.db import models
from apps.core.models.base import BaseModel
from apps.users.models.user import UserAccount

class NewsCategory(BaseModel):
    name = models.CharField(max_length=100)
    slug = models.CharField(unique=True, max_length=150)
    description = models.TextField(blank=True, null=True)
    display_order = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='newscategory_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'newscategory'

class News(BaseModel):
    title = models.CharField(max_length=255)
    slug = models.CharField(unique=True, max_length=255)
    content = models.TextField(blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    category = models.ForeignKey(NewsCategory, models.DO_NOTHING, blank=True, null=True)
    featured_image = models.CharField(max_length=255, blank=True, null=True)
    is_published = models.BooleanField(blank=True, null=True)
    publish_date = models.DateTimeField(blank=True, null=True)
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    view_count = models.IntegerField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='news_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'news' 