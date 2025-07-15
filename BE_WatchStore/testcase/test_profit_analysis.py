#!/usr/bin/env python
"""
Test script cho profit analysis
"""
import os
import sys
import django

# Thêm đường dẫn project vào sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Cấu hình Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.db import connection
from decimal import Decimal

def test_profit_analysis():
    """Test API profit analysis"""
    
    # Tạo client với cấu hình test
    client = APIClient()
    client.defaults['HTTP_HOST'] = 'localhost'
    
    # URL của API
    url = '/api/reports/revenue/profit_analysis/'
    
    print(f"Testing API: {url}")
    
    # Test 1: Gọi API cơ bản
    print("\n🔍 Test 1: Gọi API profit analysis cơ bản")
    response = client.get(url)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ API hoạt động bình thường")
        print(f"📊 Kết quả:")
        print(f"   - Doanh thu gộp: {data['revenue']['gross_revenue']:,.0f} VNĐ")
        print(f"   - Giảm giá: {data['revenue']['total_discounts']:,.0f} VNĐ")
        print(f"   - Doanh thu ròng: {data['revenue']['net_revenue']:,.0f} VNĐ")
        print(f"   - Giá vốn: {data['cost_of_goods_sold']['total_cost']:,.0f} VNĐ")
        print(f"   - Lãi gộp: {data['profit']['gross_profit']:,.0f} VNĐ")
        print(f"   - Tỷ lệ lãi gộp: {data['profit']['gross_profit_margin']:.2f}%")
        print(f"   - Số đơn hàng: {data['volume']['total_orders']}")
        print(f"   - Số sản phẩm: {data['volume']['total_items']}")
        
        # Kiểm tra logic
        net_revenue = data['revenue']['net_revenue']
        total_cost = data['cost_of_goods_sold']['total_cost']
        gross_profit = data['profit']['gross_profit']
        
        # Kiểm tra công thức: Lãi gộp = Doanh thu ròng - Giá vốn
        calculated_profit = net_revenue - total_cost
        if abs(calculated_profit - gross_profit) < 0.01:
            print("✅ Công thức tính lãi gộp chính xác")
        else:
            print(f"❌ Lỗi công thức: {calculated_profit} != {gross_profit}")
        
        # Kiểm tra tỷ lệ lãi gộp
        calculated_margin = (gross_profit / net_revenue * 100) if net_revenue else 0
        if abs(calculated_margin - data['profit']['gross_profit_margin']) < 0.01:
            print("✅ Tỷ lệ lãi gộp chính xác")
        else:
            print(f"❌ Lỗi tỷ lệ lãi gộp: {calculated_margin:.2f}% != {data['profit']['gross_profit_margin']:.2f}%")
            
    else:
        print(f"❌ API lỗi: {response.status_code}")
        print(f"Response: {response.content}")
        return False
    
    # Test 2: Gọi API với tham số ngày cụ thể
    print("\n🔍 Test 2: Gọi API với tham số ngày")
    response = client.get(url, {
        'start_date': '2025-01-01',
        'end_date': '2025-07-16'
    })
    
    if response.status_code == 200:
        data = response.json()
        print("✅ API với tham số ngày hoạt động bình thường")
        print(f"📅 Kỳ báo cáo: {data['period']['start_date']} đến {data['period']['end_date']}")
    else:
        print(f"❌ API với tham số ngày lỗi: {response.status_code}")
    
    # Test 3: Kiểm tra dữ liệu COGS bằng SQL trực tiếp
    print("\n🔍 Test 3: Kiểm tra dữ liệu COGS bằng SQL trực tiếp")
    
    with connection.cursor() as cursor:
        # Kiểm tra số lượng đơn hàng
        cursor.execute("""
            SELECT COUNT(DISTINCT o.id) as total_orders,
                   SUM(o.total_amount) as gross_revenue,
                   SUM(od.quantity) as total_items
            FROM orders o
            LEFT JOIN orderdetail od ON o.id = od.order_id AND od.is_deleted = FALSE
            WHERE o.order_date >= '2025-01-01' 
                AND o.order_date <= '2025-07-16' 
                AND o.status IN ('delivered', 'completed')
                AND o.is_deleted = FALSE
        """)
        order_result = cursor.fetchone()
        
        if order_result:
            total_orders, gross_revenue, total_items = order_result
            print(f"📊 Dữ liệu đơn hàng:")
            print(f"   - Tổng đơn hàng: {total_orders}")
            print(f"   - Doanh thu gộp: {gross_revenue or 0:,.0f} VNĐ")
            print(f"   - Tổng sản phẩm: {total_items or 0}")
        
        # Kiểm tra dữ liệu nhập kho
        cursor.execute("""
            SELECT COUNT(DISTINCT gr.id) as total_receipts,
                   SUM(grd.accepted_quantity) as total_received_qty,
                   SUM(grd.unit_price * grd.accepted_quantity) as total_cost
            FROM goods_receipts gr
            JOIN goods_receipt_details grd ON gr.id = grd.goods_receipt_id
            WHERE gr.status IN ('confirmed', 'completed')
                AND gr.is_deleted = FALSE
                AND grd.is_deleted = FALSE
                AND grd.accepted_quantity > 0
        """)
        receipt_result = cursor.fetchone()
        
        if receipt_result:
            total_receipts, total_received_qty, total_cost = receipt_result
            print(f"📦 Dữ liệu nhập kho:")
            print(f"   - Tổng phiếu nhập: {total_receipts}")
            print(f"   - Tổng số lượng nhập: {total_received_qty or 0}")
            print(f"   - Tổng giá vốn: {total_cost or 0:,.0f} VNĐ")
    
    return True

if __name__ == "__main__":
    print("🚀 Bắt đầu test profit analysis...")
    success = test_profit_analysis()
    if success:
        print("\n✅ Tất cả test đều thành công!")
    else:
        print("\n❌ Có lỗi trong quá trình test!") 