from django.db import models
from django.utils import timezone

class BaseModel(models.Model):
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """
        Soft delete - chỉ đánh dấu là đã xóa thay vì xóa thật
        """
        self.is_deleted = True
        self.save()

    def hard_delete(self, *args, **kwargs):
        """
        Hard delete - xóa thật khỏi database
        """
        super().delete(*args, **kwargs)

    class Meta:
        abstract = True

class SoftDeleteMixin(models.Model):
    is_deleted = models.BooleanField(default=False)
    
    def delete(self, *args, **kwargs):
        """
        Soft delete - chỉ đánh dấu là đã xóa thay vì xóa thật
        """
        self.is_deleted = True
        self.save()

    def hard_delete(self, *args, **kwargs):
        """
        Hard delete - xóa thật khỏi database
        """
        super().delete(*args, **kwargs)
    
    class Meta:
        abstract = True