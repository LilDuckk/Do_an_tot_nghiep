from django.db import models
from django.db.models import Sum, F, Q
from decimal import Decimal
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
    receipt_number = models.CharField(max_length=50, verbose_name="Mã phiếu nhập")
    purchase_order = models.ForeignKey(
        PurchaseOrder, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='goods_receipts',
        verbose_name="Đơn đặt hàng"
    )
    supplier = models.ForeignKey(
        Supplier, 
        on_delete=models.CASCADE, 
        verbose_name="Nhà cung cấp",
        help_text="Tự động lấy từ đơn đặt hàng nếu có"
    )
    store = models.ForeignKey(
        Store, 
        on_delete=models.CASCADE, 
        verbose_name="Cửa hàng",
        help_text="Tự động lấy từ đơn đặt hàng nếu có"
    )
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, verbose_name="Nhân viên tạo")
    
    # Thông tin nhập kho
    receipt_date = models.DateTimeField(verbose_name="Ngày nhập kho")
    expected_receipt_date = models.DateTimeField(null=True, blank=True, verbose_name="Ngày nhập kho dự kiến")
    delivery_note = models.CharField(max_length=100, blank=True, verbose_name="Số phiếu giao hàng")
    vehicle_number = models.CharField(max_length=20, blank=True, verbose_name="Số xe")
    driver_name = models.CharField(max_length=100, blank=True, verbose_name="Tên tài xế")
    
    # Trạng thái
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name="Trạng thái")
    
    # Thông tin tài chính (chỉ tính cho hàng chấp nhận)
    subtotal = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Tổng tiền hàng")
    tax_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Thuế")
    discount_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Giảm giá")
    total_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0, verbose_name="Tổng tiền")
    
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
        # Đảm bảo mỗi đơn đặt hàng chỉ có 1 phiếu nhập kho
        unique_together = [['purchase_order', 'is_deleted']]
        # Đảm bảo mã phiếu nhập là duy nhất khi chưa xóa mềm
        constraints = [
            models.UniqueConstraint(
                fields=['receipt_number'],
                condition=models.Q(is_deleted=False),
                name='unique_receipt_number_not_deleted'
            )
        ]
    
    def __str__(self):
        return f"GR-{self.receipt_number} - {self.supplier.name}"
    
    def save(self, *args, **kwargs):
        # Tự động điền thông tin từ purchase_order nếu có
        if self.purchase_order and not self.pk:  # Chỉ khi tạo mới
            self.supplier = self.purchase_order.supplier
            self.store = self.purchase_order.store
            # Có thể điền thêm các thông tin khác nếu cần
            if not self.expected_receipt_date:
                self.expected_receipt_date = self.purchase_order.expected_delivery_date
        
        # Tự động tính tổng tiền
        self.total_amount = self.subtotal + self.tax_amount - self.discount_amount
        super().save(*args, **kwargs)
    
    @property
    def can_update_inventory(self):
        """Kiểm tra xem có thể cập nhật tồn kho không"""
        return self.status in ['confirmed', 'completed']
    
    @property
    def is_from_purchase_order(self):
        """Kiểm tra xem có phải nhập từ đơn đặt hàng không"""
        return self.purchase_order is not None
    
    def get_quantity_variance_summary(self):
        """
        Tính toán tổng quan chênh lệch số lượng giữa đơn đặt hàng và nhập kho
        """
        if not self.purchase_order:
            return None
        
        summary = {
            'total_ordered': 0,
            'total_received': 0,
            'total_accepted': 0,
            'total_rejected': 0,
            'total_missing': 0,
            'variance_quantity': 0,
            'variance_percentage': 0,
            'quality_issues': 0,
            'items_with_variance': []
        }
        
        # Lấy tất cả chi tiết đơn đặt hàng
        po_details = self.purchase_order.details.all()
        
        for po_detail in po_details:
            # Tìm chi tiết nhập kho tương ứng
            gr_detail = self.details.filter(
                purchase_order_detail=po_detail
            ).first()
            
            if gr_detail:
                # Tính toán chênh lệch
                missing_quantity = gr_detail.missing_quantity
                quality_issues = gr_detail.rejected_quantity
                
                summary['total_ordered'] += po_detail.quantity
                summary['total_received'] += gr_detail.received_quantity
                summary['total_accepted'] += gr_detail.accepted_quantity
                summary['total_rejected'] += gr_detail.rejected_quantity
                summary['total_missing'] += gr_detail.missing_quantity
                summary['quality_issues'] += quality_issues
                
                # Ghi lại các item có chênh lệch
                if missing_quantity > 0 or quality_issues > 0:
                    summary['items_with_variance'].append({
                        'product': po_detail.product_variant.name,
                        'ordered_quantity': po_detail.quantity,
                        'received_quantity': gr_detail.received_quantity,
                        'accepted_quantity': gr_detail.accepted_quantity,
                        'rejected_quantity': gr_detail.rejected_quantity,
                        'missing_quantity': gr_detail.missing_quantity,
                        'quality_status': gr_detail.quality_status,
                        'quality_notes': gr_detail.quality_notes
                    })
        
        # Tính phần trăm chênh lệch
        if summary['total_ordered'] > 0:
            summary['variance_quantity'] = summary['total_received'] - summary['total_ordered']
            summary['variance_percentage'] = (summary['variance_quantity'] / summary['total_ordered']) * 100
        
        return summary
    
    def get_financial_variance_summary(self):
        """
        Tính toán chênh lệch tài chính giữa đơn đặt hàng và nhập kho
        """
        if not self.purchase_order:
            return None
        
        summary = {
            'po_total_amount': 0,
            'gr_total_amount': 0,
            'variance_amount': 0,
            'variance_percentage': 0,
            'quality_loss_amount': 0,
            'items_with_financial_variance': []
        }
        
        # Tính tổng tiền đơn đặt hàng
        po_details = self.purchase_order.details.all()
        for po_detail in po_details:
            summary['po_total_amount'] += po_detail.total_amount
        
        # Tính tổng tiền phiếu nhập kho (chỉ hàng chấp nhận)
        summary['gr_total_amount'] = self.total_amount
        
        # Tính chênh lệch
        summary['variance_amount'] = summary['gr_total_amount'] - summary['po_total_amount']
        
        if summary['po_total_amount'] > 0:
            summary['variance_percentage'] = (summary['variance_amount'] / summary['po_total_amount']) * 100
        
        # Tính thiệt hại do hàng kém chất lượng
        for detail in self.details.all():
            if detail.rejected_quantity > 0:
                rejected_amount = (detail.rejected_quantity * detail.unit_price * 
                                 (1 - detail.discount_percent / 100) * 
                                 (1 + detail.tax_percent / 100))
                summary['quality_loss_amount'] += rejected_amount
                
                summary['items_with_financial_variance'].append({
                    'product': detail.product_variant.name,
                    'rejected_quantity': detail.rejected_quantity,
                    'rejected_amount': rejected_amount,
                    'quality_notes': detail.quality_notes
                })
        
        return summary
    
    def get_quality_issues_summary(self):
        """
        Tóm tắt các vấn đề chất lượng
        """
        summary = {
            'total_items': 0,
            'items_with_issues': 0,
            'fully_rejected_items': 0,
            'partially_rejected_items': 0,
            'quality_issues': []
        }
        
        for detail in self.details.all():
            summary['total_items'] += 1
            
            if detail.rejected_quantity > 0:
                summary['items_with_issues'] += 1
                
                if detail.rejected_quantity == detail.received_quantity:
                    summary['fully_rejected_items'] += 1
                else:
                    summary['partially_rejected_items'] += 1
                
                summary['quality_issues'].append({
                    'product': detail.product_variant.name,
                    'received_quantity': detail.received_quantity,
                    'accepted_quantity': detail.accepted_quantity,
                    'rejected_quantity': detail.rejected_quantity,
                    'quality_status': detail.quality_status,
                    'quality_notes': detail.quality_notes,
                    'batch_number': detail.batch_number,
                    'expiry_date': detail.expiry_date
                })
        
        return summary
    
    @classmethod
    def create_from_purchase_order(cls, purchase_order, **kwargs):
        """
        Tạo phiếu nhập kho từ đơn đặt hàng
        """
        # Tự động điền thông tin từ purchase_order
        kwargs.update({
            'purchase_order': purchase_order,
            'supplier': purchase_order.supplier,
            'store': purchase_order.store,
            'expected_receipt_date': kwargs.get('expected_receipt_date', purchase_order.expected_delivery_date),
        })
        
        return cls.objects.create(**kwargs) 