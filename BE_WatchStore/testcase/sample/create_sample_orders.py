#!/usr/bin/env python
"""
Script tạo dữ liệu đơn hàng mẫu tự động dựa trên dữ liệu hiện có
"""

import os
import sys
import django
import random
from pathlib import Path
from decimal import Decimal
from datetime import datetime, timedelta, date
import unidecode
from django.db.models import Sum

# Thêm đường dẫn dự án vào Python path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.apps import apps
from apps.orders.models.order import Orders
from apps.orders.models.order_detail import OrderDetail
from apps.orders.models.customer import Customer
from apps.products.models.variant import ProductVariant
from apps.stores.models.store import Store
from apps.stores.models.employee import Employee
from apps.orders.models.coupon import Coupon
from apps.users.models import UserAccount


def generate_order_number():
    """Tạo mã đơn hàng ngẫu nhiên"""
    year = datetime.now().year
    month = datetime.now().month
    random_num = random.randint(1000, 9999)
    return f"ORD{year}{month:02d}{random_num:04d}"


def generate_tracking_number():
    """Tạo mã tracking ngẫu nhiên"""
    letters = ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ', k=3))
    numbers = ''.join(random.choices('0123456789', k=10))
    return f"{letters}{numbers}"


def generate_random_date(start_date, end_date):
    """Tạo ngày ngẫu nhiên trong khoảng thời gian"""
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    random_date = start_date + timedelta(days=random_number_of_days)
    
    # Thêm giờ ngẫu nhiên
    random_hour = random.randint(8, 22)  # Giờ hoạt động
    random_minute = random.randint(0, 59)
    random_second = random.randint(0, 59)
    
    return random_date.replace(hour=random_hour, minute=random_minute, second=random_second)


def generate_shipping_address():
    """Tạo địa chỉ giao hàng ngẫu nhiên"""
    cities = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Nha Trang', 'Huế', 'Vũng Tàu']
    districts = ['Quận 1', 'Quận 2', 'Quận 3', 'Quận Hoàn Kiếm', 'Quận Ba Đình', 'Quận Hai Bà Trưng']
    streets = ['Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Lý Thường Kiệt', 'Phan Chu Trinh', 'Hàng Bông']
    
    city = random.choice(cities)
    district = random.choice(districts)
    street = random.choice(streets)
    number = random.randint(1, 200)
    
    return f"{number} {street}, {district}, {city}"


def create_sample_orders(num_orders=30):
    """Tạo dữ liệu đơn hàng mẫu"""
    print(f"=== TẠO {num_orders} ĐƠN HÀNG MẪU ===")
    
    # Lấy user đầu tiên làm created_by
    try:
        user = UserAccount.objects.first()
        if not user:
            print("❌ Không tìm thấy user nào. Vui lòng tạo user trước.")
            return
    except Exception as e:
        print(f"❌ Lỗi khi lấy user: {e}")
        return
    
    # Lấy danh sách dữ liệu hiện có
    try:
        customers = list(Customer.objects.filter(is_deleted=False).values_list('id', flat=True))
        stores = list(Store.objects.filter(is_deleted=False).values_list('id', flat=True))
        employees = list(Employee.objects.filter(is_deleted=False).values_list('id', flat=True))
        variants = list(ProductVariant.objects.filter(is_active=True).values_list('id', flat=True))
        coupons = list(Coupon.objects.filter(is_active=True, is_deleted=False).values_list('id', flat=True))
        
        if not customers:
            print("❌ Không tìm thấy customer nào. Vui lòng tạo customer trước.")
            return
        if not stores:
            print("❌ Không tìm thấy store nào. Vui lòng tạo store trước.")
            return
        if not employees:
            print("❌ Không tìm thấy employee nào. Vui lòng tạo employee trước.")
            return
        if not variants:
            print("❌ Không tìm thấy product variant nào. Vui lòng tạo product variant trước.")
            return
            
    except Exception as e:
        print(f"❌ Lỗi khi lấy dữ liệu: {e}")
        return
    
    # Định nghĩa khoảng thời gian (6 tháng gần đây)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)
    
    # Định nghĩa trạng thái đơn hàng
    order_statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled']
    payment_methods = ['cash', 'bank_transfer', 'credit_card', 'momo', 'zalopay', 'vnpay']
    payment_statuses = ['pending', 'paid', 'failed', 'refunded']
    shipping_methods = ['standard', 'express', 'same_day', 'pickup']
    
    created_orders = []
    
    for i in range(num_orders):
        try:
            # Tạo thông tin cơ bản
            order_date = generate_random_date(start_date, end_date)
            status = random.choice(order_statuses)
            payment_method = random.choice(payment_methods)
            payment_status = random.choice(payment_statuses)
            shipping_method = random.choice(shipping_methods)
            is_online_order = random.choice([True, False])
            
            # Tạo đơn hàng
            order = Orders.objects.create(
                customer_id=random.choice(customers),
                store_id=random.choice(stores),
                employee_id=random.choice(employees),
                order_date=order_date,
                status=status,
                payment_method=payment_method,
                payment_status=payment_status,
                shipping_address=generate_shipping_address(),
                shipping_method=shipping_method,
                tracking_number=generate_tracking_number() if shipping_method != 'pickup' else None,
                subtotal=Decimal('0'),
                tax=Decimal(str(random.randint(0, 10))),  # 0-10% thuế
                shipping_fee=Decimal(str(random.randint(0, 50000))),  # 0-50k phí ship
                discount=Decimal('0'),
                total_amount=Decimal('0'),
                note=f"Đơn hàng mẫu {i+1}",
                is_online_order=is_online_order,
                created_by=user,
                updated_by=user
            )
            
            created_orders.append(order)
            print(f"✅ Đã tạo đơn hàng: {order.id} - {status} - {payment_method}")
            
        except Exception as e:
            print(f"❌ Lỗi khi tạo đơn hàng {i+1}: {e}")
            continue
    
    print(f"\n🎉 Hoàn thành! Đã tạo {len(created_orders)} đơn hàng")
    return created_orders


def create_sample_order_details(orders, details_per_order=3):
    """Tạo chi tiết đơn hàng"""
    print(f"\n=== TẠO CHI TIẾT ĐƠN HÀNG ({details_per_order} chi tiết/đơn) ===")
    
    # Lấy danh sách product variants và coupons
    try:
        variants = list(ProductVariant.objects.filter(is_active=True).values_list('id', flat=True))
        coupons = list(Coupon.objects.filter(is_active=True, is_deleted=False).values_list('id', flat=True))
        
        if not variants:
            print("❌ Không tìm thấy product variant nào.")
            return
    except Exception as e:
        print(f"❌ Lỗi khi lấy dữ liệu: {e}")
        return
    
    total_details = 0
    
    for order in orders:
        print(f"\n📦 Tạo chi tiết cho đơn hàng: {order.id}")
        
        # Chọn ngẫu nhiên variants cho đơn hàng này
        selected_variants = random.sample(variants, min(details_per_order, len(variants)))
        
        for variant_id in selected_variants:
            try:
                # Lấy thông tin variant
                variant = ProductVariant.objects.get(id=variant_id)
                
                # Tạo thông tin chi tiết
                quantity = random.randint(1, 5)  # Số lượng từ 1-5
                
                # Tính giá cơ bản
                base_price = variant.product.base_price
                price_adjustment = variant.price_adjustment or Decimal('0')
                unit_price = base_price + price_adjustment
                
                # Chọn coupon ngẫu nhiên (30% khả năng có coupon)
                coupon = None
                if random.random() < 0.3 and coupons:
                    coupon = Coupon.objects.get(id=random.choice(coupons))
                
                # Tính discount từ coupon
                discount_amount = Decimal('0')
                if coupon and coupon.is_valid():
                    if coupon.discount_type == 'percentage':
                        discount_amount = (unit_price * coupon.discount_value) / 100
                    else:  # fixed amount
                        discount_amount = coupon.discount_value
                    
                    # Đảm bảo discount không vượt quá giá sản phẩm
                    discount_amount = min(discount_amount, unit_price)
                
                # Tính final_price
                final_price = (unit_price - discount_amount) * quantity
                
                # Tạo chi tiết đơn hàng
                detail = OrderDetail.objects.create(
                    order=order,
                    product_variant=variant,
                    quantity=quantity,
                    unit_price=unit_price,
                    discount=discount_amount,
                    coupon=coupon,
                    final_price=final_price
                )
                
                total_details += 1
                product_name = variant.product.name if variant.product else f"Variant {variant.id}"
                print(f"  ✅ Chi tiết: {product_name}, SL: {quantity}, Giá: {unit_price:,.0f}, Giảm: {discount_amount:,.0f}")
                
            except Exception as e:
                print(f"  ❌ Lỗi khi tạo chi tiết: {e}")
                continue
    
    print(f"\n🎉 Hoàn thành! Đã tạo {total_details} chi tiết đơn hàng")


def update_order_totals(orders):
    """Cập nhật tổng tiền cho các đơn hàng"""
    print(f"\n=== CẬP NHẬT TỔNG TIỀN ĐƠN HÀNG ===")
    
    updated_count = 0
    
    for order in orders:
        try:
            # Cập nhật tổng tiền
            order.update_totals()
            updated_count += 1
            print(f"  ✅ Cập nhật đơn hàng {order.id}: {order.total_amount:,.0f} VNĐ")
            
        except Exception as e:
            print(f"  ❌ Lỗi khi cập nhật đơn hàng {order.id}: {e}")
            continue
    
    print(f"\n🎉 Hoàn thành! Đã cập nhật {updated_count} đơn hàng")


def check_existing_data():
    """Kiểm tra dữ liệu hiện có"""
    print("=== KIỂM TRA DỮ LIỆU HIỆN CÓ ===")
    
    try:
        order_count = Orders.objects.count()
        order_detail_count = OrderDetail.objects.count()
        customer_count = Customer.objects.filter(is_deleted=False).count()
        store_count = Store.objects.filter(is_deleted=False).count()
        employee_count = Employee.objects.filter(is_deleted=False).count()
        variant_count = ProductVariant.objects.filter(is_active=True).count()
        coupon_count = Coupon.objects.filter(is_active=True, is_deleted=False).count()
        
        print(f"📊 Số lượng hiện tại:")
        print(f"  - Đơn hàng: {order_count}")
        print(f"  - Chi tiết đơn hàng: {order_detail_count}")
        print(f"  - Khách hàng: {customer_count}")
        print(f"  - Cửa hàng: {store_count}")
        print(f"  - Nhân viên: {employee_count}")
        print(f"  - Product Variant active: {variant_count}")
        print(f"  - Coupon active: {coupon_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi kiểm tra dữ liệu: {e}")
        return False


def generate_order_statistics():
    """Tạo thống kê đơn hàng"""
    print(f"\n=== THỐNG KÊ ĐƠN HÀNG ===")
    
    try:
        total_orders = Orders.objects.count()
        completed_orders = Orders.objects.filter(status__in=['completed', 'delivered']).count()
        cancelled_orders = Orders.objects.filter(status='cancelled').count()
        pending_orders = Orders.objects.filter(status='pending').count()
        
        online_orders = Orders.objects.filter(is_online_order=True).count()
        offline_orders = Orders.objects.filter(is_online_order=False).count()
        
        total_revenue = Orders.objects.filter(
            status__in=['completed', 'delivered']
        ).aggregate(
            total=Sum('total_amount')
        )['total'] or Decimal('0')
        
        avg_order_value = total_revenue / completed_orders if completed_orders > 0 else Decimal('0')
        
        print(f"📈 Thống kê:")
        print(f"  - Tổng đơn hàng: {total_orders}")
        print(f"  - Đơn hàng hoàn thành: {completed_orders}")
        print(f"  - Đơn hàng đã hủy: {cancelled_orders}")
        print(f"  - Đơn hàng chờ xử lý: {pending_orders}")
        print(f"  - Đơn hàng online: {online_orders}")
        print(f"  - Đơn hàng offline: {offline_orders}")
        print(f"  - Tổng doanh thu: {total_revenue:,.0f} VNĐ")
        print(f"  - Giá trị đơn hàng trung bình: {avg_order_value:,.0f} VNĐ")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi tạo thống kê: {e}")
        return False


def main():
    """Hàm chính"""
    print("🚀 BẮT ĐẦU TẠO DỮ LIỆU ĐƠN HÀNG MẪU")
    print("=" * 60)
    
    # Kiểm tra dữ liệu hiện có
    if not check_existing_data():
        return
    
    # Hỏi người dùng
    try:
        num_orders = int(input("\nNhập số lượng đơn hàng muốn tạo (mặc định 30): ") or "30")
        details_per_order = int(input("Nhập số chi tiết mỗi đơn hàng (mặc định 3): ") or "3")
    except ValueError:
        print("❌ Số lượng không hợp lệ, sử dụng giá trị mặc định")
        num_orders = 30
        details_per_order = 3
    
    # Tạo đơn hàng
    orders = create_sample_orders(num_orders)
    
    if orders:
        # Tạo chi tiết đơn hàng
        create_sample_order_details(orders, details_per_order)
        
        # Cập nhật tổng tiền
        update_order_totals(orders)
        
        # Thống kê cuối
        print("\n" + "=" * 60)
        print("📈 THỐNG KÊ CUỐI")
        print(f"  - Đơn hàng đã tạo: {len(orders)}")
        print(f"  - Chi tiết đơn hàng đã tạo: {len(orders) * details_per_order}")
        print(f"  - Tổng đơn hàng trong DB: {Orders.objects.count()}")
        print(f"  - Tổng chi tiết đơn hàng trong DB: {OrderDetail.objects.count()}")
        
        # Tạo thống kê
        generate_order_statistics()
    
    print("\n✅ HOÀN THÀNH!")


if __name__ == '__main__':
    main() 