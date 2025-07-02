from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount
from apps.orders.models.customer import Customer
from apps.orders.models.order import Orders

class ReturnOrder(BaseModel):
    RETURN_STATUS_CHOICES = [
        ('PENDING', 'Chờ xử lý'),
        ('APPROVED', 'Đã duyệt'),
        ('REJECTED', 'Từ chối'),
        ('COMPLETED', 'Hoàn thành'),
        ('CANCELLED', 'Đã hủy'),
    ]
    
    REFUND_STATUS_CHOICES = [
        ('PENDING', 'Chờ hoàn tiền'),
        ('PROCESSING', 'Đang xử lý'),
        ('COMPLETED', 'Đã hoàn tiền'),
        ('FAILED', 'Hoàn tiền thất bại'),
    ]
    
    order = models.ForeignKey(Orders, models.DO_NOTHING, blank=True, null=True)
    customer = models.ForeignKey(Customer, models.DO_NOTHING, blank=True, null=True)
    return_date = models.DateTimeField(blank=True, null=True)
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=RETURN_STATUS_CHOICES, default='PENDING')
    refund_amount = models.DecimalField(max_digits=25, decimal_places=2, blank=True, null=True)
    refund_method = models.CharField(max_length=50, blank=True, null=True)
    refund_status = models.CharField(max_length=50, choices=REFUND_STATUS_CHOICES, default='PENDING')
    return_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    approved_by = models.ForeignKey(UserAccount, models.DO_NOTHING, blank=True, null=True, related_name='return_orders_approved')
    approved_date = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='returnorder_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'returnorder'
        indexes = [
            models.Index(fields=['return_number']),
            models.Index(fields=['status']),
            models.Index(fields=['return_date']),
            models.Index(fields=['order']),
            models.Index(fields=['customer']),
        ]

    def clean(self):
        if self.order:
            # Kiểm tra order có thể trả hàng không
            if self.order.status not in ['completed', 'delivered']:
                raise ValidationError('Order must be completed or delivered to be returned')
            
            # Kiểm tra thời gian trả hàng (ví dụ: trong vòng 30 ngày)
            if self.order.order_date:
                days_since_order = (timezone.now() - self.order.order_date).days
                if days_since_order > 30:
                    raise ValidationError('Return request must be within 30 days of order date')
        
        # Kiểm tra refund_amount
        if self.refund_amount and self.refund_amount < 0:
            raise ValidationError('Refund amount cannot be negative')
        
        # Kiểm tra approved_date
        if self.approved_date and self.return_date:
            if self.approved_date < self.return_date:
                raise ValidationError('Approved date cannot be before return date')

    def generate_return_number(self):
        """Tạo số đơn trả hàng tự động"""
        if not self.order:
            return None
        
        order_number = f"O{self.order.id:06d}"
        return_date = self.return_date.strftime('%Y%m%d') if self.return_date else timezone.now().strftime('%Y%m%d')
        return f"R{order_number}-{return_date}-{self.id:04d}"

    def can_be_approved(self):
        """Kiểm tra có thể duyệt đơn trả hàng không"""
        return self.status == 'PENDING'

    def can_be_rejected(self):
        """Kiểm tra có thể từ chối đơn trả hàng không"""
        return self.status == 'PENDING'

    def can_be_completed(self):
        """Kiểm tra có thể hoàn thành đơn trả hàng không"""
        return self.status == 'APPROVED'

    def calculate_refund_amount(self):
        """Tính toán số tiền hoàn trả"""
        if not self.order:
            return 0
        
        total_return_amount = 0
        for return_detail in self.returnorderdetail_set.all():
            if return_detail.order_detail:
                # Tính theo tỷ lệ số lượng trả
                original_quantity = return_detail.order_detail.quantity
                return_quantity = return_detail.quantity
                original_price = return_detail.order_detail.final_price
                
                if original_quantity > 0:
                    return_ratio = return_quantity / original_quantity
                    total_return_amount += original_price * return_ratio
        
        return total_return_amount

    def approve_return(self, approved_by_user, **kwargs):
        """Duyệt đơn trả hàng"""
        if not self.can_be_approved():
            raise ValidationError('Return order cannot be approved in current status')
        
        self.status = 'APPROVED'
        self.approved_by = approved_by_user
        self.approved_date = timezone.now()
        self.refund_amount = self.calculate_refund_amount()
        self.updated_by = approved_by_user
        
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        
        self.save()

    def reject_return(self, rejected_by_user, rejection_reason):
        """Từ chối đơn trả hàng"""
        if not self.can_be_rejected():
            raise ValidationError('Return order cannot be rejected in current status')
        
        self.status = 'REJECTED'
        self.rejection_reason = rejection_reason
        self.updated_by = rejected_by_user
        self.save()

    def complete_return(self, completed_by_user):
        """Hoàn thành đơn trả hàng"""
        if not self.can_be_completed():
            raise ValidationError('Return order cannot be completed in current status')
        
        self.status = 'COMPLETED'
        self.refund_status = 'COMPLETED'
        self.updated_by = completed_by_user
        self.save()

    def save(self, *args, **kwargs):
        # Tự động tạo return_number
        if not self.return_number:
            self.return_number = self.generate_return_number()
        
        # Tự động cập nhật return_date nếu chưa có
        if not self.return_date:
            self.return_date = timezone.now()
        
        # Tự động tính refund_amount nếu chưa có
        if not self.refund_amount and self.status == 'APPROVED':
            self.refund_amount = self.calculate_refund_amount()
        
        super().save(*args, **kwargs)

    @classmethod
    def create_from_order(cls, order, customer, reason, user=None, **kwargs):
        """Tạo return order từ order"""
        if not order or order.status not in ['completed', 'delivered']:
            raise ValidationError('Order must be completed or delivered to be returned')
        
        return_order = cls.objects.create(
            order=order,
            customer=customer,
            reason=reason,
            status='PENDING',
            created_by=user,
            updated_by=user,
            **kwargs
        )
        
        return return_order 