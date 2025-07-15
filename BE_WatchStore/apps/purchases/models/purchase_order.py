from django.db import models
from apps.core.models.base import BaseModel
from apps.stores.models.store import Store
from apps.stores.models.employee import Employee
from apps.stores.models.supplier import Supplier
from apps.users.models.user import UserAccount


class PurchaseOrder(BaseModel):
    """
    Model quản lý đơn đặt hàng mua từ nhà cung cấp
    """
    STATUS_CHOICES = [
        ('draft', 'Nháp'),
        ('pending', 'Chờ xác nhận'),
        ('confirmed', 'Đã xác nhận'),
        ('ordered', 'Đã đặt hàng'),
        ('receiving', 'Đang nhận hàng'),
        ('completed', 'Hoàn thành'),
        ('cancelled', 'Đã hủy'),
    ]
    
    # Thông tin cơ bản
    po_number = models.CharField(max_length=50, unique=True, verbose_name="Mã đơn đặt hàng")
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE, verbose_name="Nhà cung cấp")
    store = models.ForeignKey(Store, on_delete=models.CASCADE, verbose_name="Cửa hàng")
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, verbose_name="Nhân viên tạo")
    
    # Thông tin đơn hàng
    order_date = models.DateTimeField(verbose_name="Ngày đặt hàng")
    expected_delivery_date = models.DateTimeField(verbose_name="Ngày giao hàng dự kiến")
    actual_delivery_date = models.DateTimeField(null=True, blank=True, verbose_name="Ngày giao hàng thực tế")
    
    # Trạng thái và thông tin thanh toán
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name="Trạng thái")
    payment_terms = models.CharField(max_length=200, blank=True, verbose_name="Điều khoản thanh toán")
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
    shipping_address = models.TextField(blank=True, verbose_name="Địa chỉ giao hàng")
    shipping_method = models.CharField(max_length=100, blank=True, verbose_name="Phương thức vận chuyển")
    
    # Thông tin người tạo/cập nhật
    created_by = models.ForeignKey(
        UserAccount, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='purchase_orders_created',
        verbose_name="Người tạo"
    )
    updated_by = models.ForeignKey(
        UserAccount, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='purchase_orders_updated',
        verbose_name="Người cập nhật"
    )
    
    class Meta:
        db_table = 'purchase_orders'
        verbose_name = "Đơn đặt hàng mua"
        verbose_name_plural = "Đơn đặt hàng mua"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"PO-{self.po_number} - {self.supplier.name}"
    
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
    def can_receive_goods(self):
        """Kiểm tra xem có thể nhận hàng không"""
        return self.status in ['ordered', 'receiving'] 