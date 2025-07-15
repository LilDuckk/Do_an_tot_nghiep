#!/usr/bin/env python
"""
Script tạo dữ liệu khách hàng mẫu tự động
"""

import os
import sys
import django
import random
from pathlib import Path
from datetime import date, timedelta
import unidecode

# Thêm đường dẫn dự án vào Python path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.apps import apps
from apps.orders.models.customer import Customer
from apps.users.models import UserAccount


def generate_customer_name():
    """Tạo tên khách hàng ngẫu nhiên"""
    first_names = ['Nguyễn', 'Trần', 'Quách', 'Dương', 'Lê', 'Lý', 'Cung']
    last_names = ['Việt', 'Đức', 'Trung', 'Đạt', 'Dương', 'Hoàn', 'Linh', 'Hiền', 'Thúy', 'Nhi', 'Vi', 'Ngọc', 'My', 'Uyên', 'Quỳnh']
    
    first_name = random.choice(first_names)
    last_name = random.choice(last_names)
    
    return first_name, last_name


def generate_email(first_name, last_name):
    """Tạo email từ họ tên"""
    # Chuyển họ tên thành không dấu và viết thường
    first_name_clean = unidecode.unidecode(first_name.lower())
    last_name_clean = unidecode.unidecode(last_name.lower())
    
    # Tạo 4 số random
    random_numbers = ''.join([str(random.randint(0, 9)) for _ in range(4)])
    
    # Tạo email
    email = f"{first_name_clean}{last_name_clean}{random_numbers}@gmail.com"
    
    return email


def generate_phone():
    """Tạo số điện thoại ngẫu nhiên"""
    # Bắt đầu bằng 09
    phone = "09"
    # Thêm 8 số random
    for _ in range(8):
        phone += str(random.randint(0, 9))
    
    return phone


def generate_address():
    """Tạo địa chỉ ngẫu nhiên ở Việt Nam"""
    cities = [
        'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 
        'Huế', 'Nha Trang', 'Vũng Tàu', 'Đà Lạt', 'Hạ Long', 'Quy Nhơn',
        'Buôn Ma Thuột', 'Thái Nguyên', 'Vinh', 'Thanh Hóa', 'Nam Định',
        'Hải Dương', 'Bắc Ninh', 'Thái Bình', 'Quảng Ninh'
    ]
    
    districts = [
        'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
        'Quận 11', 'Quận 12', 'Quận Bình Tân', 'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú',
        'Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Hai Bà Trưng', 'Quận Đống Đa', 'Quận Tây Hồ', 'Quận Cầu Giấy', 'Quận Thanh Xuân',
        'Quận Hoàng Mai', 'Quận Long Biên', 'Quận Nam Từ Liêm', 'Quận Bắc Từ Liêm', 'Quận Hà Đông'
    ]
    
    streets = [
        'Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Lý Thường Kiệt', 'Phan Chu Trinh',
        'Điện Biên Phủ', 'Cách Mạng Tháng 8', '3 Tháng 2', 'Võ Văn Tần', 'Pasteur',
        'Lê Duẩn', 'Hai Bà Trưng', 'Nguyễn Thị Minh Khai', 'Võ Thị Sáu', 'Lê Văn Việt',
        'Nguyễn Văn Quỳ', 'Lê Văn Lương', 'Nguyễn Hữu Thọ', 'Mai Chí Thọ', 'Võ Văn Ngân'
    ]
    
    city = random.choice(cities)
    district = random.choice(districts)
    street = random.choice(streets)
    number = random.randint(1, 999)
    
    address = f"{number} {street}, {district}, {city}"
    
    return address


def generate_birth_date():
    """Tạo ngày sinh ngẫu nhiên (18-65 tuổi)"""
    # Tính ngày hiện tại
    today = date.today()
    
    # Random tuổi từ 18 đến 65
    age = random.randint(18, 65)
    
    # Tính năm sinh
    birth_year = today.year - age
    
    # Random tháng và ngày
    birth_month = random.randint(1, 12)
    birth_day = random.randint(1, 28)  # Dùng 28 để tránh lỗi tháng 2
    
    try:
        birth_date = date(birth_year, birth_month, birth_day)
        return birth_date
    except ValueError:
        # Nếu có lỗi, trả về ngày mặc định
        return date(birth_year, 1, 1)


def create_sample_customers(num_customers=20):
    """Tạo dữ liệu khách hàng mẫu"""
    print(f"=== TẠO {num_customers} KHÁCH HÀNG MẪU ===")
    
    # Lấy user đầu tiên làm created_by
    try:
        user = UserAccount.objects.first()
        if not user:
            print("❌ Không tìm thấy user nào. Vui lòng tạo user trước.")
            return
    except Exception as e:
        print(f"❌ Lỗi khi lấy user: {e}")
        return
    
    created_customers = []
    
    for i in range(num_customers):
        try:
            # Tạo tên khách hàng
            first_name, last_name = generate_customer_name()
            
            # Tạo email
            email = generate_email(first_name, last_name)
            
            # Kiểm tra email đã tồn tại chưa
            while Customer.objects.filter(email=email).exists():
                first_name, last_name = generate_customer_name()
                email = generate_email(first_name, last_name)
            
            # Tạo số điện thoại
            phone = generate_phone()
            
            # Kiểm tra số điện thoại đã tồn tại chưa
            while Customer.objects.filter(phone=phone).exists():
                phone = generate_phone()
            
            # Tạo khách hàng
            customer = Customer.objects.create(
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone=phone,
                address=generate_address(),
                birth_date=generate_birth_date(),
                gender=random.choice(['male', 'female', 'other']),
                notes=f"Khách hàng mẫu {i+1}",
                created_by=user,
                updated_by=user
            )
            
            created_customers.append(customer)
            print(f"✅ Đã tạo khách hàng: {first_name} {last_name} ({email})")
            
        except Exception as e:
            print(f"❌ Lỗi khi tạo khách hàng {i+1}: {e}")
            continue
    
    print(f"\n🎉 Hoàn thành! Đã tạo {len(created_customers)} khách hàng")
    return created_customers


def check_existing_data():
    """Kiểm tra dữ liệu hiện có"""
    print("=== KIỂM TRA DỮ LIỆU HIỆN CÓ ===")
    
    try:
        total_customers = Customer.objects.count()
        print(f"📊 Tổng số khách hàng hiện có: {total_customers}")
        
        if total_customers > 0:
            print("\n📋 Mẫu khách hàng:")
            sample_customers = Customer.objects.all()[:5]
            for customer in sample_customers:
                print(f"  - {customer.first_name} {customer.last_name} ({customer.email})")
        
        return total_customers
        
    except Exception as e:
        print(f"❌ Lỗi khi kiểm tra dữ liệu: {e}")
        return 0


def main():
    """Hàm chính"""
    print("🚀 BẮT ĐẦU TẠO DỮ LIỆU KHÁCH HÀNG MẪU")
    print("=" * 50)
    
    # Kiểm tra dữ liệu hiện có
    existing_count = check_existing_data()
    
    if existing_count > 0:
        print(f"\n⚠️  Đã có {existing_count} khách hàng trong database.")
        response = input("Bạn có muốn tiếp tục tạo thêm khách hàng mẫu? (y/n): ")
        if response.lower() != 'y':
            print("❌ Đã hủy tạo dữ liệu mẫu.")
            return
    
    # Tạo khách hàng mẫu
    customers = create_sample_customers(20)
    
    if customers:
        print("\n" + "=" * 50)
        print("🎉 HOÀN THÀNH TẠO DỮ LIỆU KHÁCH HÀNG MẪU")
        print(f"📊 Đã tạo thành công {len(customers)} khách hàng")
        
        # Hiển thị thống kê
        print("\n📈 THỐNG KÊ:")
        total_customers = Customer.objects.count()
        male_count = Customer.objects.filter(gender='male').count()
        female_count = Customer.objects.filter(gender='female').count()
        other_count = Customer.objects.filter(gender='other').count()
        
        print(f"  - Tổng số khách hàng: {total_customers}")
        print(f"  - Nam: {male_count}")
        print(f"  - Nữ: {female_count}")
        print(f"  - Khác: {other_count}")
        
        # Hiển thị mẫu khách hàng mới tạo
        print("\n📋 MẪU KHÁCH HÀNG MỚI TẠO:")
        for customer in customers[:5]:
            print(f"  - {customer.first_name} {customer.last_name}")
            print(f"    Email: {customer.email}")
            print(f"    Phone: {customer.phone}")
            print(f"    Gender: {customer.get_gender_display()}")
            print(f"    Address: {customer.address}")
            print()


if __name__ == '__main__':
    main() 