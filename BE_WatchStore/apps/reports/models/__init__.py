from django.db import models
from apps.core.models.base import BaseModel

class Report(BaseModel):
    """
    Model đại diện cho reports app để tạo permission
    """
    name = models.CharField(max_length=255, verbose_name="Tên báo cáo")
    description = models.TextField(blank=True, null=True, verbose_name="Mô tả")
    
    class Meta:
        verbose_name = "Báo cáo"
        verbose_name_plural = "Báo cáo"
        permissions = [
            ("view_reports", "Có thể xem thống kê báo cáo"),
        ]
    
    def __str__(self):
        return self.name 