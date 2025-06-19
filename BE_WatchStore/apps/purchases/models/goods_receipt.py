from django.db import models
from apps.core.models.base import BaseModel
from apps.purchases.models.purchase_order import PurchaseOrder
from apps.stores.models.store import Store
from apps.stores.models.employee import Employee
from apps.stores.models.supplier import Supplier
from apps.users.models.user import UserAccount


class GoodsReceipt(BaseModel):
    """
    Model quản lý phiếu nhập kho
    """
    STATUS_CHOICES = [
        ('draft', 'Nháp'),
        ('pending', 'Chờ xác nhận'),
        ('confirmed', 'Đã xác nhận'),
        ('completed', 'Hoàn thành'),
        ('cancelled', 'Đã hủy'),
    ]
    
    # Thông tin cơ bản
    receipt_number = models.CharField(max_length=50, unique=True, verbose_name="Mã phiếu nhập")
    purchase_order = models.ForeignKey(
        PurchaseOrder, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='goods_receipts',
        verbose_name="Đơn đặt hàng"
    )
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, verbose_name="Nhà cung cấp")
    store = models.ForeignKey(Store, on_delete=models.CASCADE, verbose_name="Cửa hàng")
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, verbose_name="Nhân viên tạo")
    
    # Thông tin nhập kho
    receipt_date = models.DateTimeField(verbose_name="Ngày nhập kho")
    expected_receipt_date = models.DateTimeField(null=True, blank=True, verbose_name="Ngày nhập kho dự kiến")
    delivery_note = models.CharField(max_length=100, blank=True, verbose_name="Số phiếu giao hàng")
    vehicle_number = models.CharField(max_length=20, blank=True, verbose_name="Số xe")
    driver_name = models.CharField(max_length=100, blank=True, verbose_name="Tên tài xế")
    
    # Trạng thái và thông tin thanh toán
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name="Trạng thái")
    payment_status = models.CharField(max_length=20, choices=[
        ('pending', 'Chưa thanh toán'),
        ('partial', 'Thanh toán một phần'),
        ('paid', 'Đã thanh toán'),
    ], default='pending', verbose_name="Trạng thái thanh toán")
    
    # Thông tin tài chính
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Tổng tiền hàng")
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Thuế")
    discount_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Giảm giá")
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Tổng tiền")
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Số tiền đã thanh toán")
    
    # Ghi chú và thông tin bổ sung
    notes = models.TextField(blank=True, verbose_name="Ghi chú")
    quality_check_notes = models.TextField(blank=True, verbose_name="Ghi chú kiểm tra chất lượng")
    is_quality_checked = models.BooleanField(default=False, verbose_name="Đã kiểm tra chất lượng")
    
    # Thông tin người tạo/cập nhật
    created_by = models.ForeignKey(
        UserAccount, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='goods_receipts_created',
        verbose_name="Người tạo"
    )
    updated_by = models.ForeignKey(
        UserAccount, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='goods_receipts_updated',
        verbose_name="Người cập nhật"
    )
    
    class Meta:
        db_table = 'goods_receipts'
        verbose_name = "Phiếu nhập kho"
        verbose_name_plural = "Phiếu nhập kho"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"GR-{self.receipt_number} - {self.supplier.name}"
    
    def save(self, *args, **kwargs):
        # Tự động tính tổng tiền
        self.total_amount = self.subtotal + self.tax_amount - self.discount_amount
        super().save(*args, **kwargs)
    
    @property
    def remaining_amount(self):
        """Số tiền còn lại cần thanh toán"""
        return self.total_amount - self.paid_amount
    
    @property
    def is_fully_paid(self):
        """Kiểm tra xem đã thanh toán đủ chưa"""
        return self.paid_amount >= self.total_amount
    
    @property
    def can_update_inventory(self):
        """Kiểm tra xem có thể cập nhật tồn kho không"""
        return self.status in ['confirmed', 'completed']
    
    @property
    def is_from_purchase_order(self):
        """Kiểm tra xem có phải nhập từ đơn đặt hàng không"""
        return self.purchase_order is not None 