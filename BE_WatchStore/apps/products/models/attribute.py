from django.db import models
from apps.core.models.base import BaseModel

class AttributeType(BaseModel):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'attributetype'

class AttributeValue(BaseModel):
    attribute_type = models.ForeignKey(AttributeType, models.DO_NOTHING, blank=True, null=True)
    value = models.CharField(max_length=255)

    class Meta:
        managed = True
        db_table = 'attributevalue'
