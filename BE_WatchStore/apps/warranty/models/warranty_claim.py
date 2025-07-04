from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.core.models.base import BaseModel
from apps.users.models.user import UserAccount
from apps.warranty.models.warranty import Warranty
from apps.stores.models.employee import Employee

class WarrantyClaim(BaseModel):
    WARRANTY_STATUS_CHOICES = [
        ('PENDING', 'Chờ xử lý'),
        ('IN_PROGRESS', 'Đang xử lý'),
        ('COMPLETED', 'Hoàn thành'),
        ('REJECTED', 'Từ chối'),
        ('CANCELLED', 'Đã hủy'),
    ]
    
    warranty = models.ForeignKey(Warranty, models.DO_NOTHING, blank=True, null=True)
    claim_date = models.DateField()
    description = models.TextField()
    resolution = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=WARRANTY_STATUS_CHOICES, default='PENDING')
    completed_date = models.DateField(blank=True, null=True)
    technician = models.ForeignKey(Employee, models.DO_NOTHING, blank=True, null=True)
    repair_cost = models.DecimalField(max_digits=25, decimal_places=2, blank=True, null=True)
    claim_number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    estimated_completion_date = models.DateField(blank=True, null=True)
    customer_contact = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='warrantyclaim_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'warrantyclaim'
        indexes = [
            models.Index(fields=['claim_number']),
            models.Index(fields=['status']),
            models.Index(fields=['claim_date']),
            models.Index(fields=['warranty']),
        ]

    def clean(self):
        if self.warranty:
            # Kiểm tra warranty còn hiệu lực không
            if not self.warranty.is_active():
                raise ValidationError('Warranty is not active or has expired')
            
            # Kiểm tra claim_date không được trước warranty_start_date
            if self.claim_date < self.warranty.warranty_start_date:
                raise ValidationError('Claim date cannot be before warranty start date')
        
        # Kiểm tra completed_date
        if self.completed_date and self.claim_date:
            if self.completed_date < self.claim_date:
                raise ValidationError('Completed date cannot be before claim date')
        
        # Kiểm tra estimated_completion_date
        if self.estimated_completion_date and self.claim_date:
            if self.estimated_completion_date < self.claim_date:
                raise ValidationError('Estimated completion date cannot be before claim date')

    def generate_claim_number(self):
        """Tạo số yêu cầu bảo hành tự động"""
        if not self.warranty:
            return None
        
        warranty_number = self.warranty.warranty_number or f"W{self.warranty.id:06d}"
        claim_date = self.claim_date.strftime('%Y%m%d')
        return f"{warranty_number}-C{claim_date}-{self.id:04d}"

    def can_be_processed(self):
        """Kiểm tra có thể xử lý yêu cầu bảo hành không"""
        return self.status in ['PENDING', 'IN_PROGRESS']

    def can_be_completed(self):
        """Kiểm tra có thể hoàn thành yêu cầu bảo hành không"""
        return self.status == 'IN_PROGRESS'

    def can_be_rejected(self):
        """Kiểm tra có thể từ chối yêu cầu bảo hành không"""
        return self.status in ['PENDING', 'IN_PROGRESS']

    def get_processing_days(self):
        """Lấy số ngày xử lý"""
        if not self.completed_date:
            return (timezone.now().date() - self.claim_date).days
        return (self.completed_date - self.claim_date).days

    def is_overdue(self):
        """Kiểm tra có quá hạn xử lý không"""
        if self.estimated_completion_date:
            return timezone.now().date() > self.estimated_completion_date and self.status not in ['COMPLETED', 'REJECTED', 'CANCELLED']
        return False

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Tự động tạo claim_number sau khi đã có self.id
        if is_new and not self.claim_number:
            self.claim_number = self.generate_claim_number()
            super().save(update_fields=['claim_number'])
        
        # Tự động cập nhật completed_date khi status = COMPLETED
        if self.status == 'COMPLETED' and not self.completed_date:
            self.completed_date = timezone.now().date()
            super().save(update_fields=['completed_date'])
        
        # Tự động cập nhật estimated_completion_date nếu chưa có
        if not self.estimated_completion_date and self.status == 'PENDING':
            self.estimated_completion_date = self.claim_date + timezone.timedelta(days=7)  # Mặc định 7 ngày
            super().save(update_fields=['estimated_completion_date'])

    @classmethod
    def create_from_warranty(cls, warranty, description, user=None, **kwargs):
        """Tạo warranty claim từ warranty"""
        if not warranty or not warranty.is_active():
            raise ValidationError('Warranty is not valid or not active')
        
        claim = cls.objects.create(
            warranty=warranty,
            claim_date=timezone.now().date(),
            description=description,
            status='PENDING',
            created_by=user,
            updated_by=user,
            **kwargs
        )
        
        # Cập nhật status của warranty
        warranty.status = 'CLAIMED'
        warranty.save()
        
        return claim