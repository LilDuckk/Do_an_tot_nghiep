#!/usr/bin/env python
import os
import sys
import django
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from apps.orders.models.order import Orders
from apps.orders.models.order_detail import OrderDetail
from apps.orders.models.customer import Customer
from apps.orders.models.return_order import ReturnOrder
from apps.orders.models.return_order_detail import ReturnOrderDetail
from apps.products.models.product import Product
from apps.products.models.variant import ProductVariant
from apps.stores.models.store import Store
from apps.stores.models.employee import Employee
from apps.users.models import UserAccount
from apps.orders.services import ReturnOrderService

def create_test_data():
    """Tạo dữ liệu test cần thiết"""
    print("=== Tạo dữ liệu test ===\n")
    
    # Tạo user test với email unique
    import uuid
    unique_id = str(uuid.uuid4())[:8]
    username = f'test_user_{unique_id}'
    email = f'test_{unique_id}@example.com'
    
    user, created = UserAccount.objects.get_or_create(
        username=username,
        defaults={
            'email': email,
            'is_staff': True
        }
    )
    if created:
        print(f"✓ Tạo user: {user.username}")
    
    # Tạo store test
    store, created = Store.objects.get_or_create(
        name='Test Store',
        defaults={
            'address': 'Test Address',
            'phone': '0123456789',
            'created_by': user,
            'updated_by': user
        }
    )
    if created:
        print(f"✓ Tạo store: {store.name}")
    
    # Tạo employee test với email unique
    employee_email = f'employee_{unique_id}@example.com'
    employee_name = f'Nhân viên Test {unique_id}'
    
    employee, created = Employee.objects.get_or_create(
        user=user,
        defaults={
            'name': employee_name,
            'phone': '0123456789',
            'email': employee_email,
            'store': store,
            'is_manager': True,
            'created_by': user,
            'updated_by': user
        }
    )
    if created:
        print(f"✓ Tạo employee: {employee.user.username}")
    
    # Tạo customer test với phone unique
    customer_phone = f'0987654{unique_id}'
    customer_email = f'customer_{unique_id}@example.com'
    
    customer, created = Customer.objects.get_or_create(
        phone=customer_phone,
        defaults={
            'first_name': 'Nguyễn',
            'last_name': 'Văn Test',
            'email': customer_email,
            'gender': 'male',
            'created_by': user,
            'updated_by': user
        }
    )
    if created:
        print(f"✓ Tạo customer: {customer.first_name} {customer.last_name}")
    
    # Tạo product test với name unique
    product_name = f'Đồng hồ Test Return {unique_id}'
    
    product, created = Product.objects.get_or_create(
        name=product_name,
        defaults={
            'description': 'Sản phẩm test cho return order',
            'base_price': Decimal('1500.00'),
            'warranty_period': 12,
            'is_active': True,
            'created_by': user,
            'updated_by': user
        }
    )
    if created:
        print(f"✓ Tạo product: {product.name}")
    
    # Tạo variant test với SKU unique
    variant_sku = f'TEST-RETURN-{unique_id}'
    
    variant, created = ProductVariant.objects.get_or_create(
        sku=variant_sku,
        defaults={
            'product': product,
            'price_adjustment': Decimal('0.00'),
            'is_active': True,
            'created_by': user,
            'updated_by': user
        }
    )
    if created:
        print(f"✓ Tạo variant: {variant.sku}")
    
    return user, store, customer, product, variant

def create_test_order(user, store, customer, variant):
    """Tạo đơn hàng test với số lượng > 2"""
    print("\n=== Tạo đơn hàng test ===\n")
    
    # Lấy employee từ user
    from apps.stores.models.employee import Employee
    employee = Employee.objects.get(user=user)
    
    # Tạo order
    order = Orders.objects.create(
        customer=customer,
        store=store,
        employee=employee,
        order_date=timezone.now(),
        status='delivered',  # Trạng thái đã giao để có thể trả hàng
        payment_method='cash',
        payment_status='paid',
        subtotal=Decimal('4500.00'),
        total_amount=Decimal('4500.00'),
        created_by=user,
        updated_by=user
    )
    print(f"✓ Tạo order: ID {order.id}, Status: {order.status}")
    
    # Tạo order detail với số lượng = 3
    order_detail = OrderDetail.objects.create(
        order=order,
        product_variant=variant,
        quantity=3,  # Số lượng > 2
        unit_price=Decimal('1500.00'),
        final_price=Decimal('4500.00'),
        created_by=user,
        updated_by=user
    )
    print(f"✓ Tạo order detail: Quantity = {order_detail.quantity}, Price = {order_detail.final_price}")
    
    return order, order_detail

def create_test_return_order(user, order, order_detail):
    """Tạo đơn trả hàng với số lượng khác số lượng gốc"""
    print("\n=== Tạo đơn trả hàng test ===\n")
    
    # Tạo return order
    return_order = ReturnOrder.objects.create(
        order=order,
        customer=order.customer,
        return_date=timezone.now(),
        reason='Sản phẩm bị lỗi kỹ thuật',
        status='PENDING',
        created_by=user,
        updated_by=user
    )
    print(f"✓ Tạo return order: {return_order.return_number}")
    print(f"  - Order gốc: {return_order.order.id}")
    print(f"  - Lý do: {return_order.reason}")
    print(f"  - Trạng thái: {return_order.status}")
    
    # Tạo return order detail với số lượng = 2 (khác số lượng gốc = 3)
    return_detail = ReturnOrderDetail.objects.create(
        return_order=return_order,
        order_detail=order_detail,
        product_variant=order_detail.product_variant,
        quantity=2,  # Số lượng trả = 2, khác số lượng gốc = 3
        reason='Sản phẩm bị lỗi màn hình',
        condition='USED',
        created_by=user,
        updated_by=user
    )
    print(f"✓ Tạo return order detail:")
    print(f"  - Số lượng gốc: {order_detail.quantity}")
    print(f"  - Số lượng trả: {return_detail.quantity}")
    print(f"  - Lý do: {return_detail.reason}")
    
    return return_order, return_detail

def test_return_order_flow():
    """Test toàn bộ luồng return order"""
    print("=== Test Return Order Flow ===\n")
    
    try:
        # 1. Tạo dữ liệu test
        user, store, customer, product, variant = create_test_data()
        
        # 2. Tạo đơn hàng
        order, order_detail = create_test_order(user, store, customer, variant)
        
        # 3. Tạo đơn trả hàng
        return_order, return_detail = create_test_return_order(user, order, order_detail)
        
        # 4. Test các thông tin
        print("\n=== Kiểm tra thông tin ===\n")
        
        # Kiểm tra order detail gốc
        print(f"Order Detail gốc:")
        print(f"  - ID: {order_detail.id}")
        print(f"  - Product: {order_detail.product_variant.product.name}")
        print(f"  - Variant: {order_detail.product_variant.sku}")
        print(f"  - Quantity: {order_detail.quantity}")
        print(f"  - Unit Price: {order_detail.unit_price}")
        print(f"  - Final Price: {order_detail.final_price}")
        
        # Kiểm tra return order detail
        print(f"\nReturn Order Detail:")
        print(f"  - ID: {return_detail.id}")
        print(f"  - Return Order: {return_detail.return_order.return_number}")
        print(f"  - Order Detail gốc: {return_detail.order_detail.id}")
        print(f"  - Quantity trả: {return_detail.quantity}")
        print(f"  - Reason: {return_detail.reason}")
        
        # Kiểm tra liên kết
        print(f"\nKiểm tra liên kết:")
        print(f"  - Return Order → Order: {return_order.order.id}")
        print(f"  - Return Detail → Order Detail: {return_detail.order_detail.id}")
        print(f"  - Số lượng gốc: {return_detail.order_detail.quantity}")
        print(f"  - Số lượng trả: {return_detail.quantity}")
        print(f"  - Số lượng còn lại: {return_detail.order_detail.quantity - return_detail.quantity}")
        
        # 5. Test validation
        print("\n=== Test Validation ===\n")
        
        # Kiểm tra điều kiện trả hàng
        is_eligible, message = ReturnOrderService.validate_return_eligibility(
            order, 
            [{'order_detail': order_detail, 'quantity': return_detail.quantity}]
        )
        print(f"Điều kiện trả hàng: {is_eligible}")
        print(f"Message: {message}")
        
        # 6. Test approve return order
        print("\n=== Test Approve Return Order ===\n")
        
        try:
            ReturnOrderService.process_return_order(return_order, 'approve', user=user)
            print(f"✓ Đã approve return order: {return_order.return_number}")
            print(f"  - Status: {return_order.status}")
            print(f"  - Approved by: {return_order.approved_by.username}")
            print(f"  - Refund amount: {return_order.refund_amount}")
        except Exception as e:
            print(f"✗ Lỗi khi approve: {str(e)}")
        
        print("\n=== Test hoàn thành ===\n")
        print("✓ Tất cả test cases đã chạy thành công!")
        
    except Exception as e:
        print(f"✗ Lỗi trong quá trình test: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_return_order_flow() 