from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from apps.core.models.base import BaseModel
from apps.users.models import UserAccount
from apps.orders.models.order_detail import OrderDetail

class Warranty(BaseModel):
    WARRANTY_STATUS_CHOICES = [
        ('ACTIVE', 'Đang hiệu lực'),
        ('EXPIRED', 'Hết hạn'),
        ('CLAIMED', 'Đang bảo hành'),
        ('CANCELLED', 'Đã hủy'),
    ]
    
    order_detail = models.ForeignKey(OrderDetail, models.DO_NOTHING, blank=True, null=True)
    warranty_start_date = models.DateField()
    warranty_end_date = models.DateField()
    serial_number = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=50, choices=WARRANTY_STATUS_CHOICES, default='ACTIVE')
    warranty_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='warranty_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'warranty'
        indexes = [
            models.Index(fields=['warranty_number']),
            models.Index(fields=['status']),
            models.Index(fields=['warranty_start_date']),
            models.Index(fields=['warranty_end_date']),
        ]

    def clean(self):
        if self.warranty_start_date and self.warranty_end_date:
            if self.warranty_start_date >= self.warranty_end_date:
                raise ValidationError('Warranty end date must be after start date')
        
        if self.order_detail:
            product_variant = self.order_detail.product_variant
            warranty_period = product_variant.get_warranty_period()
            if warranty_period:
                expected_end_date = self.warranty_start_date + timedelta(days=warranty_period * 30)
                if self.warranty_end_date != expected_end_date:
                    raise ValidationError(f'Warranty end date should be {expected_end_date} based on warranty period')

    def generate_warranty_number(self):
        """Tạo số bảo hành tự động"""
        if not self.order_detail:
            return None
        
        order = self.order_detail.order
        product = self.order_detail.product_variant.product
        return f"W{order.id:06d}-{product.id:04d}-{self.id:04d}"

    def is_active(self):
        """Kiểm tra bảo hành còn hiệu lực không"""
        # Nếu warranty đã bị hủy, không còn hiệu lực
        if self.status == 'CANCELLED':
            return False
            
        today = timezone.now().date()
        return self.warranty_start_date <= today <= self.warranty_end_date

    def is_expired(self):
        """Kiểm tra bảo hành đã hết hạn chưa"""
        today = timezone.now().date()
        return today > self.warranty_end_date

    def get_remaining_days(self):
        """Lấy số ngày còn lại của bảo hành"""
        today = timezone.now().date()
        if today > self.warranty_end_date:
            return 0
        return (self.warranty_end_date - today).days

    def save(self, *args, **kwargs):
        # Tự động tính warranty_end_date nếu chưa có
        if self.order_detail and self.warranty_start_date and not self.warranty_end_date:
            product_variant = self.order_detail.product_variant
            warranty_period = product_variant.get_warranty_period()
            if warranty_period:
                self.warranty_end_date = self.warranty_start_date + timedelta(days=warranty_period * 30)

        is_new = self.pk is None
        super().save(*args, **kwargs)

        # Tự động tạo warranty_number nếu chưa có và đã có self.id
        if is_new and not self.warranty_number:
            self.warranty_number = self.generate_warranty_number()
            super().save(update_fields=['warranty_number'])

        # Tự động cập nhật status
        if self.status == 'CANCELLED':
            # Không thay đổi status nếu đã bị hủy
            pass
        elif self.is_expired():
            self.status = 'EXPIRED'
        elif self.status == 'ACTIVE' and not self.is_active():
            self.status = 'INACTIVE'
        # Nếu status thay đổi, lưu lại
        if self.pk and self.status != Warranty.objects.get(pk=self.pk).status:
            super().save(update_fields=['status'])

    @classmethod
    def create_from_order_detail(cls, order_detail, user=None):
        """Tạo warranty tự động từ order detail"""
        if not order_detail:
            return None
        
        product_variant = order_detail.product_variant
        warranty_period = product_variant.get_warranty_period()
        if not warranty_period:
            return None
        
        warranty_start_date = order_detail.order.order_date.date() if order_detail.order.order_date else timezone.now().date()
        warranty_end_date = warranty_start_date + timedelta(days=warranty_period * 30)
        
        warranty = cls.objects.create(
            order_detail=order_detail,
            warranty_start_date=warranty_start_date,
            warranty_end_date=warranty_end_date,
            status='ACTIVE',
            created_by=user,
            updated_by=user
        )
        
        return warranty 