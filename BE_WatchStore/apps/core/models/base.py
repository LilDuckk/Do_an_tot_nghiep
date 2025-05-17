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

    class Meta:
        abstract = True

class SoftDeleteMixin(models.Model):
    is_deleted = models.BooleanField(default=False)
    
    class Meta:
        abstract = True 