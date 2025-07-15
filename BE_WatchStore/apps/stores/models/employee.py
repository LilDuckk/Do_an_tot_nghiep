from django.db import models
from apps.core.models.base import BaseModel
from apps.users.models.user import UserAccount
import random
import string
from unidecode import unidecode

class Employee(BaseModel):
    user = models.ForeignKey(UserAccount, models.DO_NOTHING, blank=True, null=True, related_name='employee_user_set')
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    address = models.TextField(blank=True, null=True)
    employee_code = models.CharField(unique=True, max_length=50, blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    is_manager = models.BooleanField(default=False)
    hire_date = models.DateField(blank=True, null=True)
    auto_create = models.BooleanField(default=False)

    # ❗ Dùng string để tránh vòng lặp
    store = models.ForeignKey('stores.Store', models.DO_NOTHING, blank=True, null=True, related_name='employees')
    created_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True, related_name='employee_created_by_set')
    updated_by = models.ForeignKey(UserAccount, models.DO_NOTHING, db_column='updated_by', related_name='employee_updated_by_set', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'employee'

    def save(self, *args, **kwargs):
        if not self.employee_code:
            # Chuyển đổi tên thành không dấu và lấy chữ cái đầu
            name_parts = self.name.split()
            initials = []
            for part in name_parts:
                # Chuyển đổi các ký tự có dấu thành không dấu
                normalized = unidecode(part)
                # Chỉ lấy các chữ cái
                letters = ''.join(c for c in normalized if c.isalpha())
                if letters:
                    initials.append(letters[0].upper())
            
            # Kết hợp các chữ cái đầu
            initials_str = ''.join(initials)
            
            # Tạo 6 số ngẫu nhiên
            random_numbers = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            
            # Kết hợp thành employee_code
            self.employee_code = f"{initials_str}{random_numbers}"
            
            # Nếu auto_create=True, tạo tài khoản mới
            if self.auto_create:
                user = UserAccount.objects.create_user(
                    username=self.employee_code,
                    email=self.email,
                    password=self.employee_code,  # Mật khẩu mặc định là employee_code
                    is_staff=True,
                    is_superuser=False
                )
                self.user = user
        
        # Nếu is_manager=True, set position là "Quản lý"
        if self.is_manager:
            self.position = "Quản lý"
                
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Xóa mềm tài khoản liên kết nếu có
        if self.user:
            self.user.is_deleted = True
            self.user.save()
        
        # Xóa mềm nhân viên
        self.is_deleted = True
        self.save()
