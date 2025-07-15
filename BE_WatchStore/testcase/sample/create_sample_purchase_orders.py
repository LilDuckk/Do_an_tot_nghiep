#!/usr/bin/env python
"""
Script tạo dữ liệu phiếu đặt hàng và phiếu nhập kho mẫu tự động
"""

import os
import sys
import django
import random
from pathlib import Path
from decimal import Decimal
from datetime import datetime, timedelta, date
import unidecode

# Thêm đường dẫn dự án vào Python path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.apps import apps
from apps.purchases.models.purchase_order import PurchaseOrder
from apps.purchases.models.purchase_order_detail import PurchaseOrderDetail
from apps.purchases.models.goods_receipt import GoodsReceipt
from apps.purchases.models.goods_receipt_detail import GoodsReceiptDetail
from apps.products.models.variant import ProductVariant
from apps.stores.models.supplier import Supplier
from apps.stores.models.store import Store
from apps.stores.models.employee import Employee
from apps.users.models import UserAccount


def generate_po_number():
    """Tạo mã đơn đặt hàng ngẫu nhiên"""
    year = datetime.now().year
    month = datetime.now().month
    random_num = random.randint(1000, 9999)
    return f"PO{year}{month:02d}{random_num:04d}"


def generate_receipt_number():
    """Tạo mã phiếu nhập kho ngẫu nhiên"""
    year = datetime.now().year
    month = datetime.now().month
    random_num = random.randint(1000, 9999)
    return f"GR{year}{month:02d}{random_num:04d}"


def generate_random_date(start_date, end_date):
    """Tạo ngày ngẫu nhiên trong khoảng thời gian"""
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    random_date = start_date + timedelta(days=random_number_of_days)
    
    # Thêm giờ ngẫu nhiên
    random_hour = random.randint(8, 18)  # Giờ làm việc
    random_minute = random.randint(0, 59)
    random_second = random.randint(0, 59)
    
    return random_date.replace(hour=random_hour, minute=random_minute, second=random_second)


def generate_unit_price():
    """Tạo đơn giá ngẫu nhiên"""
    # Random từ 100,000 đến 5,000,000
    base = random.randint(100, 5000) * 1000
    return Decimal(str(base))


def create_sample_purchase_orders(num_orders=15):
    """Tạo dữ liệu phiếu đặt hàng mẫu"""
    print(f"=== TẠO {num_orders} PHIẾU ĐẶT HÀNG MẪU ===")
    
    # Lấy user đầu tiên làm created_by
    try:
        user = UserAccount.objects.first()
        if not user:
            print("❌ Không tìm thấy user nào. Vui lòng tạo user trước.")
            return
    except Exception as e:
        print(f"❌ Lỗi khi lấy user: {e}")
        return
    
    # Lấy danh sách supplier, store, employee, product variants
    try:
        suppliers = list(Supplier.objects.filter(is_active=True).values_list('id', flat=True))
        stores = list(Store.objects.filter(id__in=[3, 4]).values_list('id', flat=True))
        employees = list(Employee.objects.filter(is_deleted=False).values_list('id', flat=True))
        variants = list(ProductVariant.objects.filter(is_active=True).values_list('id', flat=True))
        
        if not suppliers:
            print("❌ Không tìm thấy supplier nào. Vui lòng tạo supplier trước.")
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
    
    # Định nghĩa khoảng thời gian
    start_date = datetime(2025, 1, 1)
    end_date = datetime(2025, 7, 16)
    
    created_orders = []
    
    for i in range(num_orders):
        try:
            # Tạo thông tin cơ bản
            po_number = generate_po_number()
            
            # Kiểm tra po_number đã tồn tại chưa
            while PurchaseOrder.objects.filter(po_number=po_number).exists():
                po_number = generate_po_number()
            
            # Tạo ngày ngẫu nhiên
            order_date = generate_random_date(start_date, end_date)
            expected_delivery_date = order_date + timedelta(days=random.randint(7, 30))
            
            # Tạo phiếu đặt hàng
            purchase_order = PurchaseOrder.objects.create(
                po_number=po_number,
                supplier_id=random.choice(suppliers),
                store_id=random.choice(stores),
                employee_id=random.choice(employees),
                order_date=order_date,
                expected_delivery_date=expected_delivery_date,
                status=random.choice(['draft', 'pending', 'confirmed', 'ordered', 'receiving', 'completed']),
                payment_terms="Thanh toán sau 30 ngày",
                payment_status=random.choice(['pending', 'partial', 'paid']),
                subtotal=Decimal('0'),
                tax_amount=Decimal('0'),
                discount_amount=Decimal('0'),
                total_amount=Decimal('0'),
                paid_amount=Decimal('0'),
                notes=f"Phiếu đặt hàng mẫu {i+1}",
                shipping_address="Địa chỉ giao hàng mẫu",
                shipping_method="Vận chuyển đường bộ",
                created_by=user,
                updated_by=user
            )
            
            created_orders.append(purchase_order)
            print(f"✅ Đã tạo phiếu đặt hàng: {po_number} (ID: {purchase_order.id})")
            
        except Exception as e:
            print(f"❌ Lỗi khi tạo phiếu đặt hàng {i+1}: {e}")
            continue
    
    print(f"\n🎉 Hoàn thành! Đã tạo {len(created_orders)} phiếu đặt hàng")
    return created_orders


def create_sample_purchase_order_details(purchase_orders, details_per_order=3):
    """Tạo chi tiết phiếu đặt hàng"""
    print(f"\n=== TẠO CHI TIẾT PHIẾU ĐẶT HÀNG ({details_per_order} chi tiết/phiếu) ===")
    
    # Lấy danh sách product variants
    try:
        variants = list(ProductVariant.objects.filter(is_active=True).values_list('id', flat=True))
        if not variants:
            print("❌ Không tìm thấy product variant nào.")
            return
    except Exception as e:
        print(f"❌ Lỗi khi lấy dữ liệu: {e}")
        return
    
    total_details = 0
    
    for purchase_order in purchase_orders:
        print(f"\n📦 Tạo chi tiết cho phiếu đặt hàng: {purchase_order.po_number}")
        
        # Chọn ngẫu nhiên variants cho phiếu này
        selected_variants = random.sample(variants, min(details_per_order, len(variants)))
        
        for variant_id in selected_variants:
            try:
                # Tạo thông tin chi tiết
                quantity = random.randint(10, 50)
                unit_price = generate_unit_price()
                discount_percent = Decimal(str(random.randint(0, 15)))  # 0-15%
                tax_percent = Decimal(str(random.randint(0, 10)))  # 0-10%
                
                # Tính toán các giá trị
                discount_amount = (quantity * unit_price * discount_percent) / 100
                subtotal = (quantity * unit_price) - discount_amount
                tax_amount = (subtotal * tax_percent) / 100
                
                # Tạo chi tiết phiếu đặt hàng
                detail = PurchaseOrderDetail.objects.create(
                    purchase_order=purchase_order,
                    product_variant_id=variant_id,
                    quantity=quantity,
                    received_quantity=0,  # Chưa nhận
                    unit_price=unit_price,
                    discount_percent=discount_percent,
                    discount_amount=discount_amount,
                    tax_percent=tax_percent,
                    tax_amount=tax_amount,
                    subtotal=subtotal,
                    notes=f"Chi tiết sản phẩm {variant_id}",
                    expected_delivery_date=purchase_order.expected_delivery_date
                )
                
                total_details += 1
                print(f"  ✅ Chi tiết: Sản phẩm {variant_id}, SL: {quantity}, Giá: {unit_price:,.0f}")
                
            except Exception as e:
                print(f"  ❌ Lỗi khi tạo chi tiết: {e}")
                continue
    
    print(f"\n🎉 Hoàn thành! Đã tạo {total_details} chi tiết phiếu đặt hàng")


def create_sample_goods_receipts(purchase_orders, receipt_ratio=0.7):
    """Tạo phiếu nhập kho từ phiếu đặt hàng"""
    print(f"\n=== TẠO PHIẾU NHẬP KHO (tỷ lệ {receipt_ratio*100}%) ===")
    
    # Lấy user đầu tiên làm created_by
    try:
        user = UserAccount.objects.first()
    except Exception as e:
        print(f"❌ Lỗi khi lấy user: {e}")
        return
    
    # Chọn ngẫu nhiên các phiếu đặt hàng để tạo phiếu nhập kho
    orders_to_receive = random.sample(purchase_orders, int(len(purchase_orders) * receipt_ratio))
    
    created_receipts = []
    
    for purchase_order in orders_to_receive:
        try:
            # Tạo mã phiếu nhập kho
            receipt_number = generate_receipt_number()
            
            # Kiểm tra receipt_number đã tồn tại chưa
            while GoodsReceipt.objects.filter(receipt_number=receipt_number).exists():
                receipt_number = generate_receipt_number()
            
            # Tạo ngày nhập kho (sau ngày đặt hàng)
            receipt_date = purchase_order.order_date + timedelta(days=random.randint(5, 25))
            expected_receipt_date = purchase_order.expected_delivery_date
            
            # Tạo phiếu nhập kho
            goods_receipt = GoodsReceipt.objects.create(
                receipt_number=receipt_number,
                purchase_order=purchase_order,
                supplier=purchase_order.supplier,
                store=purchase_order.store,
                employee_id=purchase_order.employee_id,
                receipt_date=receipt_date,
                expected_receipt_date=expected_receipt_date,
                delivery_note=f"DN{receipt_number}",
                vehicle_number=f"51A-{random.randint(10000, 99999)}",
                driver_name=f"Tài xế {random.randint(1, 100)}",
                status=random.choice(['draft', 'pending', 'confirmed', 'completed']),
                subtotal=Decimal('0'),
                tax_amount=Decimal('0'),
                discount_amount=Decimal('0'),
                total_amount=Decimal('0'),
                notes=f"Phiếu nhập kho từ {purchase_order.po_number}",
                quality_check_notes="Kiểm tra chất lượng mẫu",
                is_quality_checked=random.choice([True, False]),
                created_by=user,
                updated_by=user
            )
            
            created_receipts.append(goods_receipt)
            print(f"✅ Đã tạo phiếu nhập kho: {receipt_number} từ {purchase_order.po_number}")
            
        except Exception as e:
            print(f"❌ Lỗi khi tạo phiếu nhập kho cho {purchase_order.po_number}: {e}")
            continue
    
    print(f"\n🎉 Hoàn thành! Đã tạo {len(created_receipts)} phiếu nhập kho")
    return created_receipts


def create_sample_goods_receipt_details(goods_receipts):
    """Tạo chi tiết phiếu nhập kho"""
    print(f"\n=== TẠO CHI TIẾT PHIẾU NHẬP KHO ===")
    
    total_details = 0
    
    for goods_receipt in goods_receipts:
        print(f"\n📦 Tạo chi tiết cho phiếu nhập kho: {goods_receipt.receipt_number}")
        
        # Lấy chi tiết phiếu đặt hàng
        po_details = goods_receipt.purchase_order.details.all()
        
        for po_detail in po_details:
            try:
                # Tạo thông tin nhập kho
                received_quantity = random.randint(po_detail.quantity - 5, po_detail.quantity + 2)  # Có thể thiếu hoặc thừa
                accepted_quantity = random.randint(max(0, received_quantity - 3), received_quantity)  # Chấp nhận phần lớn
                rejected_quantity = received_quantity - accepted_quantity
                
                # Tạo chi tiết phiếu nhập kho
                detail = GoodsReceiptDetail.objects.create(
                    goods_receipt=goods_receipt,
                    purchase_order_detail=po_detail,
                    product_variant=po_detail.product_variant,
                    ordered_quantity=po_detail.quantity,
                    received_quantity=received_quantity,
                    accepted_quantity=accepted_quantity,
                    rejected_quantity=rejected_quantity,
                    unit_price=po_detail.unit_price,
                    discount_percent=po_detail.discount_percent,
                    discount_amount=po_detail.discount_amount,
                    tax_percent=po_detail.tax_percent,
                    tax_amount=po_detail.tax_amount,
                    subtotal=po_detail.subtotal,
                    quality_status=random.choice(['pending', 'accepted', 'rejected', 'partial']),
                    quality_notes=f"Ghi chú chất lượng cho {po_detail.product_variant.product.name}",
                    expiry_date=date.today() + timedelta(days=random.randint(365, 1095)),  # 1-3 năm
                    batch_number=f"BATCH{random.randint(10000, 99999)}",
                    notes=f"Chi tiết nhập kho cho {po_detail.product_variant.product.name}"
                )
                
                total_details += 1
                print(f"  ✅ Chi tiết: {po_detail.product_variant.product.name}, Nhận: {received_quantity}, Chấp nhận: {accepted_quantity}")
                
            except Exception as e:
                print(f"  ❌ Lỗi khi tạo chi tiết nhập kho: {e}")
                continue
    
    print(f"\n🎉 Hoàn thành! Đã tạo {total_details} chi tiết phiếu nhập kho")


def check_existing_data():
    """Kiểm tra dữ liệu hiện có"""
    print("=== KIỂM TRA DỮ LIỆU HIỆN CÓ ===")
    
    try:
        po_count = PurchaseOrder.objects.count()
        po_detail_count = PurchaseOrderDetail.objects.count()
        gr_count = GoodsReceipt.objects.count()
        gr_detail_count = GoodsReceiptDetail.objects.count()
        supplier_count = Supplier.objects.filter(is_active=True).count()
        store_count = Store.objects.filter(id__in=[3, 4]).count()
        employee_count = Employee.objects.filter(is_deleted=False).count()
        variant_count = ProductVariant.objects.filter(is_active=True).count()
        
        print(f"📊 Số lượng hiện tại:")
        print(f"  - Phiếu đặt hàng: {po_count}")
        print(f"  - Chi tiết phiếu đặt hàng: {po_detail_count}")
        print(f"  - Phiếu nhập kho: {gr_count}")
        print(f"  - Chi tiết phiếu nhập kho: {gr_detail_count}")
        print(f"  - Supplier active: {supplier_count}")
        print(f"  - Store (ID 3-4): {store_count}")
        print(f"  - Employee (ID 1-8): {employee_count}")
        print(f"  - Product Variant active: {variant_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi kiểm tra dữ liệu: {e}")
        return False


def main():
    """Hàm chính"""
    print("🚀 BẮT ĐẦU TẠO DỮ LIỆU PHIẾU ĐẶT HÀNG VÀ NHẬP KHO MẪU")
    print("=" * 60)
    
    # Kiểm tra dữ liệu hiện có
    if not check_existing_data():
        return
    
    # Hỏi người dùng
    try:
        num_orders = int(input("\nNhập số lượng phiếu đặt hàng muốn tạo (mặc định 15): ") or "15")
        details_per_order = int(input("Nhập số chi tiết mỗi phiếu đặt hàng (mặc định 3): ") or "3")
        receipt_ratio = float(input("Nhập tỷ lệ tạo phiếu nhập kho (0.0-1.0, mặc định 0.7): ") or "0.7")
    except ValueError:
        print("❌ Số lượng không hợp lệ, sử dụng giá trị mặc định")
        num_orders = 15
        details_per_order = 3
        receipt_ratio = 0.7
    
    # Tạo phiếu đặt hàng
    purchase_orders = create_sample_purchase_orders(num_orders)
    
    if purchase_orders:
        # Tạo chi tiết phiếu đặt hàng
        create_sample_purchase_order_details(purchase_orders, details_per_order)
        
        # Tạo phiếu nhập kho
        goods_receipts = create_sample_goods_receipts(purchase_orders, receipt_ratio)
        
        if goods_receipts:
            # Tạo chi tiết phiếu nhập kho
            create_sample_goods_receipt_details(goods_receipts)
        
        # Thống kê cuối
        print("\n" + "=" * 60)
        print("📈 THỐNG KÊ CUỐI")
        print(f"  - Phiếu đặt hàng đã tạo: {len(purchase_orders)}")
        print(f"  - Chi tiết phiếu đặt hàng đã tạo: {len(purchase_orders) * details_per_order}")
        print(f"  - Phiếu nhập kho đã tạo: {len(goods_receipts) if goods_receipts else 0}")
        print(f"  - Tổng phiếu đặt hàng trong DB: {PurchaseOrder.objects.count()}")
        print(f"  - Tổng chi tiết phiếu đặt hàng trong DB: {PurchaseOrderDetail.objects.count()}")
        print(f"  - Tổng phiếu nhập kho trong DB: {GoodsReceipt.objects.count()}")
        print(f"  - Tổng chi tiết phiếu nhập kho trong DB: {GoodsReceiptDetail.objects.count()}")
    
    print("\n✅ HOÀN THÀNH!")


if __name__ == '__main__':
    main() 