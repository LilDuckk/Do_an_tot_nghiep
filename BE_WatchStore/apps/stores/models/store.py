from django.db import models
from apps.core.models.base import BaseModel
from apps.users.models.user import UserAccount

class Store(BaseModel):
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    store_code = models.CharField(unique=True, max_length=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # ❗ Dùng string để tránh vòng lặp
    manager = models.ForeignKey('stores.Employee', models.DO_NOTHING, blank=True, null=True, related_name='managed_stores')

    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='store_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'store'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def delete(self, *args, **kwargs):
        # Xóa mềm tất cả nhân viên của cửa hàng
        for employee in self.employees.all():
            employee.delete()
        
        # Xóa mềm cửa hàng
        self.is_deleted = True
        self.save()
