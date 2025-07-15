from rest_framework import serializers
from apps.users.models.user import UserAccount
from apps.stores.models.employee import Employee
import random
import string
from unidecode import unidecode

class ResetPasswordSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(help_text="ID của tài khoản cần reset mật khẩu")
    
    def validate_user_id(self, value):
        try:
            user = UserAccount.objects.get(id=value, is_deleted=False)
            return value
        except UserAccount.DoesNotExist:
            raise serializers.ValidationError("Tài khoản không tồn tại.")
    
    def create(self, validated_data):
        user_id = validated_data['user_id']
        user = UserAccount.objects.get(id=user_id)
        
        # Kiểm tra xem user có phải là employee không
        try:
            employee = Employee.objects.get(user=user, is_deleted=False)
            # Nếu là employee, reset về employee_code
            new_password = employee.employee_code
            password_source = "employee_code"
        except Employee.DoesNotExist:
            # Nếu không phải employee, tạo random code
            new_password = self._generate_random_password()
            password_source = "random_code"
        
        # Reset mật khẩu
        user.set_password(new_password)
        user.save()
        
        return {
            'user_id': user_id,
            'username': user.username,
            'email': user.email,
            'new_password': new_password,
            'password_source': password_source,
            'message': f'Mật khẩu đã được reset thành công. Mật khẩu mới: {new_password}'
        }
    
    def _generate_random_password(self):
        """Tạo mật khẩu ngẫu nhiên 8 ký tự"""
        # Tạo 4 chữ cái ngẫu nhiên
        letters = ''.join(random.choices(string.ascii_letters, k=4))
        # Tạo 4 số ngẫu nhiên
        numbers = ''.join(random.choices(string.digits, k=4))
        # Kết hợp và xáo trộn
        password = letters + numbers
        return ''.join(random.sample(password, len(password))) 