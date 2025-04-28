from django.db import models
from apps.core.models.base import BaseModel

class Warranty(BaseModel):
    order_detail = models.ForeignKey('OrderDetail', models.DO_NOTHING, blank=True, null=True)
    warranty_start_date = models.DateField()
    warranty_end_date = models.DateField()
    serial_number = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    created_by = models.ForeignKey('UserAccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('UserAccount', models.DO_NOTHING, db_column='updated_by', related_name='warranty_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'warranty' 