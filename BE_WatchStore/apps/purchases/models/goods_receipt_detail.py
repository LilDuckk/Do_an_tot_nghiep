from django.db import models
from apps.core.models.base import BaseModel
from apps.purchases.models.goods_receipt import GoodsReceipt
from apps.purchases.models.purchase_order_detail import PurchaseOrderDetail
from apps.products.models.variant import ProductVariant


class GoodsReceiptDetail(BaseModel):
    """
    Model quản lý chi tiết phiếu nhập kho
    """
    goods_receipt = models.ForeignKey(
        GoodsReceipt, 
        on_delete=models.CASCADE, 
        related_name='details',
        verbose_name="Phiếu nhập kho"
    )
    purchase_order_detail = models.ForeignKey(
        PurchaseOrderDetail, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name="Chi tiết đơn đặt hàng"
    )
    product_variant = models.ForeignKey(
        ProductVariant, 
        on_delete=models.CASCADE,
        verbose_name="Sản phẩm"
    )
    
    # Thông tin số lượng và giá
    ordered_quantity = models.PositiveIntegerField(default=0, verbose_name="Số lượng đã đặt")
    received_quantity = models.PositiveIntegerField(verbose_name="Số lượng nhập")
    accepted_quantity = models.PositiveIntegerField(default=0, verbose_name="Số lượng chấp nhận")
    rejected_quantity = models.PositiveIntegerField(default=0, verbose_name="Số lượng từ chối")
    
    unit_price = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Đơn giá")
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="Phần trăm giảm giá")
    discount_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Số tiền giảm giá")
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="Phần trăm thuế")
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Số tiền thuế")
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Thành tiền")
    
    # Thông tin chất lượng
    quality_status = models.CharField(max_length=20, choices=[
        ('pending', 'Chờ kiểm tra'),
        ('accepted', 'Chấp nhận'),
        ('rejected', 'Từ chối'),
        ('partial', 'Chấp nhận một phần'),
    ], default='pending', verbose_name="Trạng thái chất lượng")
    
    quality_notes = models.TextField(blank=True, verbose_name="Ghi chú chất lượng")
    expiry_date = models.DateField(null=True, blank=True, verbose_name="Ngày hết hạn")
    batch_number = models.CharField(max_length=50, blank=True, verbose_name="Số lô")
    
    # Thông tin bổ sung
    notes = models.TextField(blank=True, verbose_name="Ghi chú")
    
    class Meta:
        db_table = 'goods_receipt_details'
        verbose_name = "Chi tiết phiếu nhập kho"
        verbose_name_plural = "Chi tiết phiếu nhập kho"
        # Đảm bảo mỗi sản phẩm chỉ xuất hiện một lần trong phiếu nhập kho (chỉ áp dụng cho bản ghi chưa xóa)
        constraints = [
            models.UniqueConstraint(
                fields=['goods_receipt', 'product_variant'],
                condition=models.Q(is_deleted=False),
                name='unique_goods_receipt_product_not_deleted'
            )
        ]
    
    def __str__(self):
        return f"{self.goods_receipt.receipt_number} - {self.product_variant.name}"
    
    def save(self, *args, **kwargs):
        # Tự động tính toán các giá trị
        self._calculate_quantities()
        self._calculate_amounts()
        self._update_quality_status()
        super().save(*args, **kwargs)
    
    def _calculate_quantities(self):
        """Tự động tính toán số lượng"""
        # Tự động tính rejected_quantity = received_quantity - accepted_quantity
        self.rejected_quantity = max(0, self.received_quantity - self.accepted_quantity)
    
    def _calculate_amounts(self):
        """Tính toán các giá trị tiền"""
        # Tính subtotal trước khi giảm giá (chỉ tính số lượng chấp nhận)
        base_subtotal = self.accepted_quantity * self.unit_price
        
        # Tính giảm giá
        if self.discount_percent > 0:
            self.discount_amount = (base_subtotal * self.discount_percent) / 100
        else:
            self.discount_amount = 0
        
        # Tính subtotal sau giảm giá
        self.subtotal = base_subtotal - self.discount_amount
        
        # Tính thuế
        if self.tax_percent > 0:
            self.tax_amount = (self.subtotal * self.tax_percent) / 100
        else:
            self.tax_amount = 0
    
    def _update_quality_status(self):
        """Cập nhật trạng thái chất lượng dựa trên số lượng"""
        if self.received_quantity == 0:
            self.quality_status = 'pending'
        elif self.accepted_quantity == self.received_quantity:
            self.quality_status = 'accepted'
        elif self.rejected_quantity == self.received_quantity:
            self.quality_status = 'rejected'
        else:
            self.quality_status = 'partial'
    
    @property
    def missing_quantity(self):
        """Số lượng thiếu = ordered_quantity - received_quantity"""
        return max(0, self.ordered_quantity - self.received_quantity)
    
    @property
    def total_amount(self):
        """Tổng tiền bao gồm thuế"""
        return self.subtotal + self.tax_amount
    
    @property
    def is_quality_checked(self):
        """Kiểm tra xem đã kiểm tra chất lượng chưa"""
        return self.quality_status != 'pending'
    
    @property
    def can_update_inventory(self):
        """Kiểm tra xem có thể cập nhật tồn kho không"""
        return self.accepted_quantity > 0 and self.quality_status in ['accepted', 'partial'] 