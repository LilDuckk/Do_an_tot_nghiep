#!/usr/bin/env python
"""
Script test đơn giản cho các API reports
"""

import os
import sys
import django
import requests
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_api_endpoints():
    """Test các API endpoints"""
    base_url = "http://localhost:8000"
    
    print("🚀 Test các API Reports")
    print("=" * 50)
    
    # Test Comprehensive Analysis
    print("\n📊 Test Comprehensive Analysis API")
    try:
        response = requests.get(f"{base_url}/api/reports/dashboard/comprehensive_analysis/")
        if response.status_code == 200:
            data = response.json()
            print("✅ API hoạt động")
            print(f"  - Doanh thu: {data['financial_summary']['total_revenue']:,.0f} VND")
            print(f"  - Lợi nhuận ròng: {data['financial_summary']['net_profit']:,.0f} VND")
            print(f"  - Tổng đơn trả: {data['return_analysis']['total_return_orders']}")
            print(f"  - Tổng bảo hành: {data['warranty_analysis']['total_warranties']}")
        else:
            print(f"❌ API lỗi: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Lỗi kết nối: {str(e)}")
    
    # Test Return Summary
    print("\n📦 Test Return Summary API")
    try:
        response = requests.get(f"{base_url}/api/reports/return-warranty-report/return_summary/")
        if response.status_code == 200:
            data = response.json()
            print("✅ API hoạt động")
            print(f"  - Tổng đơn trả: {data['summary']['total_return_orders']}")
            print(f"  - Tổng tiền hoàn: {data['summary']['total_refund_amount']:,.0f} VND")
            print(f"  - Tỷ lệ trả: {data['summary'].get('return_rate', 0):.2f}%")
        else:
            print(f"❌ API lỗi: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Lỗi kết nối: {str(e)}")
    
    # Test Warranty Summary
    print("\n🔧 Test Warranty Summary API")
    try:
        response = requests.get(f"{base_url}/api/reports/return-warranty-report/warranty_summary/")
        if response.status_code == 200:
            data = response.json()
            print("✅ API hoạt động")
            print(f"  - Tổng bảo hành: {data['summary']['total_warranties']}")
            print(f"  - Tổng yêu cầu: {data['summary']['total_warranty_claims']}")
            print(f"  - Tổng chi phí sửa: {data['summary']['total_repair_cost']:,.0f} VND")
        else:
            print(f"❌ API lỗi: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Lỗi kết nối: {str(e)}")
    
    # Test Financial Impact
    print("\n💰 Test Financial Impact API")
    try:
        response = requests.get(f"{base_url}/api/reports/return-warranty-report/financial_impact/")
        if response.status_code == 200:
            data = response.json()
            print("✅ API hoạt động")
            print(f"  - Doanh thu: {data['financial_summary']['total_revenue']:,.0f} VND")
            print(f"  - Lợi nhuận ròng: {data['financial_summary']['net_profit']:,.0f} VND")
            print(f"  - Biên lợi nhuận: {data['financial_summary']['net_profit_margin']:.2f}%")
        else:
            print(f"❌ API lỗi: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Lỗi kết nối: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎉 Hoàn thành test API!")

def check_data_summary():
    """Kiểm tra tổng quan dữ liệu"""
    print("\n📋 Tổng quan dữ liệu test:")
    print("=" * 50)
    
    from apps.orders.models.order import Orders
    from apps.orders.models.return_order import ReturnOrder
    from apps.warranty.models.warranty import Warranty
    from apps.warranty.models.warranty_claim import WarrantyClaim
    
    # Đếm dữ liệu
    total_orders = Orders.objects.filter(status__in=['delivered', 'completed']).count()
    total_returns = ReturnOrder.objects.filter(status='COMPLETED').count()
    total_warranties = Warranty.objects.count()
    total_claims = WarrantyClaim.objects.count()
    
    print(f"📦 Orders: {total_orders}")
    print(f"🔄 Return Orders: {total_returns}")
    print(f"🔧 Warranties: {total_warranties}")
    print(f"🔧 Warranty Claims: {total_claims}")
    
    if total_orders > 0:
        return_rate = (total_returns / total_orders) * 100
        print(f"📊 Tỷ lệ trả: {return_rate:.2f}%")
    
    if total_warranties > 0:
        claim_rate = (total_claims / total_warranties) * 100
        print(f"📊 Tỷ lệ yêu cầu bảo hành: {claim_rate:.2f}%")

def main():
    """Hàm chính"""
    print("🚀 Bắt đầu test API Reports")
    
    # Kiểm tra dữ liệu
    check_data_summary()
    
    # Test API endpoints
    test_api_endpoints()

if __name__ == "__main__":
    main() 