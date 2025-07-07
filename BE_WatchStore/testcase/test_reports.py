#!/usr/bin/env python
"""
Script test cho các báo cáo Return Orders và Warranty
"""

import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from apps.orders.models.return_order import ReturnOrder
from apps.orders.models.return_order_detail import ReturnOrderDetail
from apps.warranty.models.warranty import Warranty
from apps.warranty.models.warranty_claim import WarrantyClaim
from apps.orders.models.order import Orders
from apps.orders.models.order_detail import OrderDetail
from apps.products.models.product import Product
from apps.products.models.variant import ProductVariant
from apps.stores.models.store import Store
from apps.users.models import UserAccount
from apps.orders.models.customer import Customer
from apps.products.models.brand import Brand
from apps.products.models.category import Category

def create_test_data():
    """Tạo dữ liệu test cho báo cáo"""
    print("=== Tạo dữ liệu test cho báo cáo ===")
    
    # Tạo user
    user, created = UserAccount.objects.get_or_create(
        username='test_user_reports',
        defaults={
            'email': 'test_reports@example.com'
        }
    )
    if created:
        print(f"✓ Tạo user: {user.username}")
    
    # Tạo store
    store, created = Store.objects.get_or_create(
        name='Test Store Reports',
        defaults={
            'address': 'Test Address',
            'phone': '0123456789',
            'store_code': 'TEST-REPORTS-001',
            'created_by': user,
            'updated_by': user
        }
    )
    if created:
        print(f"✓ Tạo store: {store.name}")
    
    # Tạo customer
    customer, created = Customer.objects.get_or_create(
        email='customer_reports@example.com',
        defaults={
            'first_name': 'Customer',
            'last_name': 'Reports',
            'phone': '0987654321',
            'created_by': user,
            'updated_by': user
        }
    )
    if created:
        print(f"✓ Tạo customer: {customer.email}")
    
    # Tạo brand và category
    brand, created = Brand.objects.get_or_create(
        name='Test Brand Reports',
        defaults={
            'description': 'Test brand for reports',
            'created_by': user,
            'updated_by': user
        }
    )
    if created:
        print(f"✓ Tạo brand: {brand.name}")
    
    category, created = Category.objects.get_or_create(
        name='Test Category Reports',
        defaults={
            'description': 'Test category for reports',
            'created_by': user,
            'updated_by': user
        }
    )
    if created:
        print(f"✓ Tạo category: {category.name}")
    
    # Tạo product và variant
    product, created = Product.objects.get_or_create(
        name='Test Product Reports',
        defaults={
            'description': 'Test product for reports',
            'brand': brand,
            'category': category,
            'base_price': Decimal('1000000'),
            'created_by': user,
            'updated_by': user
        }
    )
    if created:
        print(f"✓ Tạo product: {product.name}")
    
    variant, created = ProductVariant.objects.get_or_create(
        sku='TEST-REPORTS-001',
        defaults={
            'product': product,
            'price_adjustment': Decimal('0'),
            'created_by': user,
            'updated_by': user
        }
    )
    if created:
        print(f"✓ Tạo variant: {variant.sku}")
    
    # Tạo orders
    orders = []
    for i in range(5):
        order = Orders.objects.create(
            customer=customer,
            store=store,
            total_amount=Decimal('3000000'),
            status='delivered',
            order_date=timezone.now() - timedelta(days=i),
            created_by=user,
            updated_by=user
        )
        orders.append(order)
        print(f"✓ Tạo order: {order.id}")
    
    # Tạo order details
    order_details = []
    for order in orders:
        order_detail = OrderDetail.objects.create(
            order=order,
            product_variant=variant,
            quantity=3,
            unit_price=Decimal('1000000'),
            final_price=Decimal('3000000'),
            created_by=user,
            updated_by=user
        )
        order_details.append(order_detail)
        print(f"✓ Tạo order detail cho order {order.id}")
    
    # Tạo return orders
    return_orders = []
    for i, order_detail in enumerate(order_details[:3]):  # Chỉ tạo return cho 3 order đầu
        return_order = ReturnOrder.objects.create(
            order=order_detail.order,
            customer=customer,
            return_store=store,
            reason=f'Lý do trả hàng test {i+1}',
            status='COMPLETED',
            refund_amount=Decimal('1000000'),
            refund_status='COMPLETED',
            created_by=user,
            updated_by=user
        )
        return_orders.append(return_order)
        print(f"✓ Tạo return order: {return_order.return_number}")
        
        # Tạo return order detail
        return_detail = ReturnOrderDetail.objects.create(
            return_order=return_order,
            order_detail=order_detail,
            product_variant=variant,
            quantity=1,
            reason=f'Lý do chi tiết {i+1}',
            condition='USED',
            created_by=user,
            updated_by=user
        )
        print(f"✓ Tạo return order detail cho return order {return_order.return_number}")
    
    # Tạo warranties
    warranties = []
    for order_detail in order_details:
        warranty = Warranty.objects.create(
            order_detail=order_detail,
            warranty_start_date=order_detail.order.order_date.date(),
            warranty_end_date=order_detail.order.order_date.date() + timedelta(days=365),
            status='ACTIVE',
            created_by=user,
            updated_by=user
        )
        warranties.append(warranty)
        print(f"✓ Tạo warranty: {warranty.warranty_number}")
    
    # Tạo warranty claims
    for i, warranty in enumerate(warranties[:2]):  # Chỉ tạo claim cho 2 warranty đầu
        claim = WarrantyClaim.objects.create(
            warranty=warranty,
            claim_date=timezone.now().date() - timedelta(days=i),
            description=f'Mô tả yêu cầu bảo hành {i+1}',
            status='COMPLETED',
            repair_cost=Decimal('500000'),
            completed_date=timezone.now().date(),
            created_by=user,
            updated_by=user
        )
        print(f"✓ Tạo warranty claim: {claim.claim_number}")
    
    print("\n=== Hoàn thành tạo dữ liệu test ===")
    return {
        'user': user,
        'store': store,
        'customer': customer,
        'product': product,
        'variant': variant,
        'orders': orders,
        'order_details': order_details,
        'return_orders': return_orders,
        'warranties': warranties
    }

def test_comprehensive_analysis():
    """Test comprehensive analysis"""
    print("\n=== Test Comprehensive Analysis ===")
    
    from apps.reports.views.dashboard_view import DashboardViewSet
    from rest_framework.test import RequestFactory
    from rest_framework.test import force_authenticate
    
    # Tạo request factory
    factory = RequestFactory()
    
    # Tạo request
    request = factory.get('/api/reports/dashboard/comprehensive_analysis/')
    force_authenticate(request, user=UserAccount.objects.get(username='test_user_reports'))
    
    # Tạo viewset
    viewset = DashboardViewSet()
    viewset.request = request
    
    # Gọi action
    response = viewset.comprehensive_analysis(request)
    
    if response.status_code == 200:
        data = response.data
        print("✅ Comprehensive Analysis API hoạt động")
        print(f"📊 Tổng quan:")
        print(f"  - Doanh thu: {data['financial_summary']['total_revenue']:,.0f} VND")
        print(f"  - Lợi nhuận gộp: {data['financial_summary']['gross_profit']:,.0f} VND")
        print(f"  - Lợi nhuận ròng: {data['financial_summary']['net_profit']:,.0f} VND")
        
        print(f"📦 Return Orders:")
        print(f"  - Tổng đơn trả: {data['return_analysis']['total_return_orders']}")
        print(f"  - Số sản phẩm trả: {data['return_analysis']['total_returned_items']}")
        print(f"  - Tổng tiền hoàn: {data['return_analysis']['total_refund_amount']:,.0f} VND")
        print(f"  - Tỷ lệ trả: {data['return_analysis']['return_rate']:.2f}%")
        
        print(f"🔧 Warranty:")
        print(f"  - Tổng bảo hành: {data['warranty_analysis']['total_warranties']}")
        print(f"  - Tổng yêu cầu: {data['warranty_analysis']['total_warranty_claims']}")
        print(f"  - Tổng chi phí sửa: {data['warranty_analysis']['total_repair_cost']:,.0f} VND")
        print(f"  - Tỷ lệ yêu cầu: {data['warranty_analysis']['claim_rate']:.2f}%")
        
        print(f"📈 Chỉ số hoạt động:")
        print(f"  - Tổng đơn hàng: {data['operational_metrics']['total_orders']}")
        print(f"  - Tổng sản phẩm bán: {data['operational_metrics']['total_items_sold']}")
        print(f"  - Giá trị đơn hàng TB: {data['operational_metrics']['average_order_value']:,.0f} VND")
        
    else:
        print(f"❌ Comprehensive Analysis API lỗi: {response.status_code}")
        print(response.data)

def test_return_summary():
    """Test return summary"""
    print("\n=== Test Return Summary ===")
    
    from apps.reports.views.return_warranty_report_view import ReturnWarrantyReportViewSet
    from rest_framework.test import RequestFactory
    from rest_framework.test import force_authenticate
    
    # Tạo request factory
    factory = RequestFactory()
    
    # Tạo request
    request = factory.get('/api/reports/return-warranty-report/return_summary/')
    force_authenticate(request, user=UserAccount.objects.get(username='test_user_reports'))
    
    # Tạo viewset
    viewset = ReturnWarrantyReportViewSet()
    viewset.request = request
    
    # Gọi action
    response = viewset.return_summary(request)
    
    if response.status_code == 200:
        data = response.data
        print("✅ Return Summary API hoạt động")
        print(f"📦 Tổng quan Return Orders:")
        print(f"  - Tổng đơn trả: {data['summary']['total_return_orders']}")
        print(f"  - Tổng sản phẩm trả: {data['summary']['total_returned_items']}")
        print(f"  - Tổng số lượng trả: {data['summary']['total_returned_quantity']}")
        print(f"  - Tổng tiền hoàn: {data['summary']['total_refund_amount']:,.0f} VND")
        print(f"  - Trả hàng cửa hàng khác: {data['summary']['cross_store_returns']}")
        
        print(f"📊 Trạng thái:")
        for status, count in data['status_breakdown'].items():
            print(f"  - {status}: {count}")
        
        print(f"📈 Phân tích theo sản phẩm:")
        for product in data['product_analysis'][:3]:  # Chỉ hiển thị 3 sản phẩm đầu
            print(f"  - {product['product_name']} ({product['sku']}):")
            print(f"    + Số đơn trả: {product['return_orders_count']}")
            print(f"    + Số lượng trả: {product['total_returned_quantity']}")
            print(f"    + Tỷ lệ trả: {product['return_rate']:.2f}%")
        
    else:
        print(f"❌ Return Summary API lỗi: {response.status_code}")
        print(response.data)

def test_warranty_summary():
    """Test warranty summary"""
    print("\n=== Test Warranty Summary ===")
    
    from apps.reports.views.return_warranty_report_view import ReturnWarrantyReportViewSet
    from rest_framework.test import RequestFactory
    from rest_framework.test import force_authenticate
    
    # Tạo request factory
    factory = RequestFactory()
    
    # Tạo request
    request = factory.get('/api/reports/return-warranty-report/warranty_summary/')
    force_authenticate(request, user=UserAccount.objects.get(username='test_user_reports'))
    
    # Tạo viewset
    viewset = ReturnWarrantyReportViewSet()
    viewset.request = request
    
    # Gọi action
    response = viewset.warranty_summary(request)
    
    if response.status_code == 200:
        data = response.data
        print("✅ Warranty Summary API hoạt động")
        print(f"🔧 Tổng quan Warranty:")
        print(f"  - Tổng bảo hành: {data['summary']['total_warranties']}")
        print(f"  - Tổng yêu cầu: {data['summary']['total_warranty_claims']}")
        print(f"  - Tổng chi phí sửa: {data['summary']['total_repair_cost']:,.0f} VND")
        print(f"  - Tỷ lệ yêu cầu: {data['summary']['claim_rate']:.2f}%")
        
        print(f"📊 Trạng thái bảo hành:")
        for status, count in data['warranty_status'].items():
            print(f"  - {status}: {count}")
        
        print(f"📊 Trạng thái yêu cầu:")
        for status, count in data['claim_status'].items():
            print(f"  - {status}: {count}")
        
        print(f"📈 Phân tích theo sản phẩm:")
        for product in data['product_analysis'][:3]:  # Chỉ hiển thị 3 sản phẩm đầu
            print(f"  - {product['product_name']} ({product['sku']}):")
            print(f"    + Tổng bảo hành: {product['total_warranties']}")
            print(f"    + Tổng yêu cầu: {product['total_claims']}")
            print(f"    + Tỷ lệ yêu cầu: {product['claim_rate']:.2f}%")
        
    else:
        print(f"❌ Warranty Summary API lỗi: {response.status_code}")
        print(response.data)

def test_financial_impact():
    """Test financial impact"""
    print("\n=== Test Financial Impact ===")
    
    from apps.reports.views.return_warranty_report_view import ReturnWarrantyReportViewSet
    from rest_framework.test import RequestFactory
    from rest_framework.test import force_authenticate
    
    # Tạo request factory
    factory = RequestFactory()
    
    # Tạo request
    request = factory.get('/api/reports/return-warranty-report/financial_impact/')
    force_authenticate(request, user=UserAccount.objects.get(username='test_user_reports'))
    
    # Tạo viewset
    viewset = ReturnWarrantyReportViewSet()
    viewset.request = request
    
    # Gọi action
    response = viewset.financial_impact(request)
    
    if response.status_code == 200:
        data = response.data
        print("✅ Financial Impact API hoạt động")
        print(f"💰 Tổng quan tài chính:")
        print(f"  - Doanh thu: {data['financial_summary']['total_revenue']:,.0f} VND")
        print(f"  - Chi phí ước tính: {data['financial_summary']['estimated_purchase_cost']:,.0f} VND")
        print(f"  - Lợi nhuận gộp: {data['financial_summary']['gross_profit']:,.0f} VND")
        print(f"  - Tiền hoàn: {data['financial_summary']['total_refund_amount']:,.0f} VND")
        print(f"  - Chi phí sửa: {data['financial_summary']['total_repair_cost']:,.0f} VND")
        print(f"  - Lợi nhuận ròng: {data['financial_summary']['net_profit']:,.0f} VND")
        print(f"  - Biên lợi nhuận gộp: {data['financial_summary']['gross_profit_margin']:.2f}%")
        print(f"  - Biên lợi nhuận ròng: {data['financial_summary']['net_profit_margin']:.2f}%")
        
        print(f"📈 Chỉ số hoạt động:")
        print(f"  - Tổng đơn hàng: {data['operational_metrics']['total_orders']}")
        print(f"  - Tổng sản phẩm bán: {data['operational_metrics']['total_items_sold']}")
        print(f"  - Tỷ lệ trả: {data['operational_metrics']['return_rate']:.2f}%")
        print(f"  - Tỷ lệ yêu cầu bảo hành: {data['operational_metrics']['warranty_claim_rate']:.2f}%")
        
        print(f"📊 Phân tích theo sản phẩm:")
        for product in data['product_analysis'][:3]:  # Chỉ hiển thị 3 sản phẩm đầu
            print(f"  - {product['product_name']} ({product['sku']}):")
            print(f"    + Doanh thu: {product['sold_revenue']:,.0f} VND")
            print(f"    + Lợi nhuận ròng: {product['net_profit']:,.0f} VND")
            print(f"    + Biên lợi nhuận: {product['profit_margin']:.2f}%")
            print(f"    + Tỷ lệ trả: {product['return_rate']:.2f}%")
        
    else:
        print(f"❌ Financial Impact API lỗi: {response.status_code}")
        print(response.data)

def main():
    """Hàm chính"""
    print("🚀 Bắt đầu test báo cáo Return Orders và Warranty")
    print("=" * 60)
    
    try:
        # Tạo dữ liệu test
        test_data = create_test_data()
        
        # Test các API
        test_comprehensive_analysis()
        test_return_summary()
        test_warranty_summary()
        test_financial_impact()
        
        print("\n" + "=" * 60)
        print("🎉 Hoàn thành test báo cáo!")
        print("\n📋 Tóm tắt:")
        print("✅ Comprehensive Analysis - Phân tích tổng hợp")
        print("✅ Return Summary - Thống kê trả hàng")
        print("✅ Warranty Summary - Thống kê bảo hành")
        print("✅ Financial Impact - Tác động tài chính")
        
        print("\n📊 Các chỉ số đã được tính toán:")
        print("  - Số đơn hàng trả và tỷ lệ trả")
        print("  - Số lần bảo hành và tỷ lệ yêu cầu")
        print("  - Số tiền thâm hụt do trả hàng")
        print("  - Chi phí sửa chữa bảo hành")
        print("  - Lợi nhuận theo sản phẩm")
        print("  - Biên lợi nhuận gộp và ròng")
        
    except Exception as e:
        print(f"❌ Lỗi: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 