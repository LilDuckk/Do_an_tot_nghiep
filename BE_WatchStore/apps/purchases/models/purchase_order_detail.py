from django.db import models
from apps.core.models.base import BaseModel
from apps.purchases.models.purchase_order import PurchaseOrder
from apps.products.models.variant import ProductVariant


class PurchaseOrderDetail(BaseModel):
    """
    Model quản lý chi tiết đơn đặt hàng mua
    """
    purchase_order = models.ForeignKey(
        PurchaseOrder, 
        on_delete=models.CASCADE, 
        related_name='details',
        verbose_name="Đơn đặt hàng"
    )
    product_variant = models.ForeignKey(
        ProductVariant, 
        on_delete=models.CASCADE,
        verbose_name="Sản phẩm"
    )
    
    # Thông tin số lượng và giá
    quantity = models.PositiveIntegerField(verbose_name="Số lượng đặt")
    received_quantity = models.PositiveIntegerField(default=0, verbose_name="Số lượng đã nhận")
    unit_price = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Đơn giá")
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="Phần trăm giảm giá")
    discount_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Số tiền giảm giá")
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name="Phần trăm thuế")
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Số tiền thuế")
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Thành tiền")
    
    # Thông tin bổ sung
    notes = models.TextField(blank=True, verbose_name="Ghi chú")
    expected_delivery_date = models.DateTimeField(null=True, blank=True, verbose_name="Ngày giao hàng dự kiến")
    
    class Meta:
        db_table = 'purchase_order_details'
        verbose_name = "Chi tiết đơn đặt hàng mua"
        verbose_name_plural = "Chi tiết đơn đặt hàng mua"
        unique_together = ['purchase_order', 'product_variant']
    
    def __str__(self):
        return f"{self.purchase_order.po_number} - {self.product_variant.product.name if self.product_variant.product else self.product_variant.sku}"
    
    def save(self, *args, **kwargs):
        # Tự động tính toán các giá trị
        self._calculate_amounts()
        super().save(*args, **kwargs)
    
    def _calculate_amounts(self):
        """Tính toán các giá trị tiền"""
        # Tính subtotal trước khi giảm giá
        base_subtotal = self.quantity * self.unit_price
        
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
    
    @property
    def total_amount(self):
        """Tổng tiền bao gồm thuế"""
        return self.subtotal + self.tax_amount 