from django.db import models
from django.contrib.auth import get_user_model
from .inventory import Inventory

User = get_user_model()

class InventoryHistory(models.Model):
    TRANSACTION_TYPES = (
        ('in', 'Nhập kho'),
        ('out', 'Xuất kho'),
        ('adjust', 'Điều chỉnh'),
    )

    inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name='history')
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    quantity = models.IntegerField()
    reference_id = models.CharField(max_length=100, blank=True, null=True)
    reference_type = models.CharField(max_length=50, blank=True, null=True)
    employee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='inventory_histories')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Lịch sử tồn kho'
        verbose_name_plural = 'Lịch sử tồn kho'

    def __str__(self):
        return f"{self.get_transaction_type_display()} - {self.quantity} - {self.created_at}" 