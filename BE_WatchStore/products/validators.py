from django.core.validators import MinValueValidator, EmailValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from decimal import Decimal
from django.utils import timezone

def validate_price(value):
    """Kiểm tra giá không được âm"""
    if value < 0:
        raise ValidationError('Giá không được âm')

def validate_quantity(value):
    """Kiểm tra số lượng phải lớn hơn 0"""
    if value < 0:
        raise ValidationError('Số lượng không được âm')

def validate_stock_quantity(value):
    """Kiểm tra số lượng tồn kho không được âm"""
    if value < 0:
        raise ValidationError('Số lượng tồn kho không được âm')

def validate_email(value):
    """Kiểm tra email hợp lệ"""
    if '@' not in value or '.' not in value:
        raise ValidationError('Email không hợp lệ')

def validate_phone(value):
    """Kiểm tra số điện thoại hợp lệ"""
    if not value.isdigit() or len(value) < 10 or len(value) > 15:
        raise ValidationError('Số điện thoại không hợp lệ')

def validate_percentage(value):
    """Kiểm tra phần trăm giảm giá hợp lệ"""
    if not 0 <= value <= 100:
        raise ValidationError('Phần trăm giảm giá phải từ 0 đến 100')

def validate_date_range(start_date, end_date):
    """Kiểm tra khoảng thời gian hợp lệ"""
    if start_date and end_date and start_date > end_date:
        raise ValidationError('Ngày kết thúc phải sau ngày bắt đầu')

def validate_order_status(status):
    """Kiểm tra trạng thái đơn hàng hợp lệ"""
    valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if status not in valid_statuses:
        raise ValidationError('Trạng thái đơn hàng không hợp lệ')

def validate_payment_method(method):
    """Kiểm tra phương thức thanh toán hợp lệ"""
    valid_methods = ['cash', 'credit_card', 'bank_transfer']
    if method not in valid_methods:
        raise ValidationError('Phương thức thanh toán không hợp lệ')

def validate_store_code(code):
    """Kiểm tra mã cửa hàng hợp lệ"""
    if not code.isalnum() or len(code) < 3:
        raise ValidationError('Mã cửa hàng phải có ít nhất 3 ký tự chữ và số')

def validate_employee_code(code):
    """Kiểm tra mã nhân viên hợp lệ"""
    if not code.startswith('EMP') or not code[3:].isdigit():
        raise ValidationError('Mã nhân viên phải bắt đầu bằng EMP và theo sau là số')

def validate_revenue_amount(amount):
    """Kiểm tra số tiền doanh thu hợp lệ"""
    if amount < 0:
        raise ValidationError('Số tiền doanh thu không được âm')
    if amount > Decimal('999999999999.99'):
        raise ValidationError('Số tiền doanh thu quá lớn')

def validate_discount_value(value):
    if value < 0:
        raise ValidationError('Giá trị giảm giá không được âm')

def validate_rating(value):
    if not 1 <= value <= 5:
        raise ValidationError('Đánh giá phải từ 1 đến 5')

def validate_sku_code(value):
    if not value.isalnum():
        raise ValidationError('Mã SKU chỉ được chứa chữ cái và số')

def validate_tracking_number(value):
    if not value.isalnum():
        raise ValidationError('Mã vận đơn chỉ được chứa chữ cái và số')

def validate_coupon_code(value):
    if not value.isalnum():
        raise ValidationError('Mã giảm giá chỉ được chứa chữ cái và số')

def validate_phone_number(value):
    if not value.isdigit() or len(value) < 10 or len(value) > 15:
        raise ValidationError('Số điện thoại không hợp lệ')

def validate_weight(value):
    if value and value < 0:
        raise ValidationError('Cân nặng không được âm')

def validate_dimensions(value):
    if value and not all(c.isdigit() or c == 'x' for c in value.lower()):
        raise ValidationError('Kích thước không hợp lệ (ví dụ: 10x20x30)')

def validate_barcode(value):
    if value and not value.isdigit():
        raise ValidationError('Mã vạch chỉ được chứa số')

def validate_ip_address(value):
    if not value:
        return
    parts = value.split('.')
    if len(parts) != 4:
        raise ValidationError('Địa chỉ IP không hợp lệ')
    for part in parts:
        if not part.isdigit() or not 0 <= int(part) <= 255:
            raise ValidationError('Địa chỉ IP không hợp lệ')

def validate_expiry_date(value):
    if value and value < timezone.now().date():
        raise ValidationError('Ngày hết hạn không được trong quá khứ')

def validate_discount_percentage(value):
    if not 0 <= value <= 100:
        raise ValidationError('Phần trăm giảm giá phải từ 0 đến 100')

def validate_usage_limit(value):
    if value < 1:
        raise ValidationError('Giới hạn sử dụng phải lớn hơn 0')

def validate_required_fields(value, required_fields):
    for field in required_fields:
        if not value.get(field):
            raise ValidationError(f'{field} là bắt buộc') 