from django.db import models
from django.contrib.auth import get_user_model
from .inventory import Inventory

User = get_user_model()

class InventoryTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('in', 'Nhập kho'),
        ('out', 'Xuất kho'),
        ('adjust', 'Điều chỉnh'),
    )

    inventory = models.ForeignKey(Inventory, models.DO_NOTHING, blank=True, null=True)
    transaction_type = models.CharField(max_length=20)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    reference_id = models.IntegerField(blank=True, null=True)
    reference_type = models.CharField(max_length=50, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    transaction_date = models.DateTimeField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(User, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(User, models.DO_NOTHING, db_column='updated_by', related_name='inventorytransaction_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'inventorytransaction'
        ordering = ['-transaction_date']
        verbose_name = 'Giao dịch tồn kho'
        verbose_name_plural = 'Giao dịch tồn kho'

    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.quantity} - {self.transaction_date}" 