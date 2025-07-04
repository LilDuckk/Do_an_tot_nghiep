#!/usr/bin/env python3
"""
Script test toàn diện cho tất cả các API báo cáo
"""

import requests
import json
from datetime import datetime, timedelta

# Cấu hình
BASE_URL = "http://localhost:8000/api"
HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyMjQzNDg3LCJpYXQiOjE3NTE2Mzg2ODcsImp0aSI6IjRlMzk4ZmM1OThiNzQzNjg4OTNkOTA3YzM1MWNiMGE2IiwidXNlcl9pZCI6MX0.ufJ-d6t80YnOon-1jv7AtedmoybTsWlhg0rx82AN2aM'
}

def test_api(url, params=None, name="API"):
    """Test một API và trả về kết quả"""
    try:
        response = requests.get(url, headers=HEADERS, params=params)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {name}: SUCCESS (200)")
            print(f"   Response size: {len(str(data))} chars")
            return True
        else:
            print(f"❌ {name}: FAILED ({response.status_code})")
            print(f"   Error: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ {name}: ERROR - {str(e)}")
        return False

def test_all_reports():
    """Test tất cả các API báo cáo"""
    print("🔍 Testing All Reports APIs...")
    print("=" * 60)
    
    # Test parameters
    start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    end_date = datetime.now().strftime('%Y-%m-%d')
    
    # 1. Dashboard APIs
    print("\n📊 Dashboard APIs:")
    test_api(f"{BASE_URL}/reports/dashboard/overview/", {"period": 30}, "Dashboard Overview")
    test_api(f"{BASE_URL}/reports/dashboard/alerts/", name="Dashboard Alerts")
    test_api(f"{BASE_URL}/reports/dashboard/comprehensive_analysis/", {"store_id": ""}, "Dashboard Comprehensive Analysis")
    
    # 2. Return & Warranty APIs
    print("\n🔄 Return & Warranty APIs:")
    test_api(f"{BASE_URL}/reports/return-warranty-report/return_summary/", {"store_id": ""}, "Return Summary")
    test_api(f"{BASE_URL}/reports/return-warranty-report/warranty_summary/", {"store_id": ""}, "Warranty Summary")
    test_api(f"{BASE_URL}/reports/return-warranty-report/financial_impact/", {"store_id": ""}, "Financial Impact")
    test_api(f"{BASE_URL}/reports/return-warranty-report/return_product_analysis/", {"limit": 10, "store_id": ""}, "Return Product Analysis")
    test_api(f"{BASE_URL}/reports/return-warranty-report/warranty_product_analysis/", {"limit": 10, "store_id": ""}, "Warranty Product Analysis")
    test_api(f"{BASE_URL}/reports/return-warranty-report/product_profitability/", {"limit": 10, "store_id": ""}, "Product Profitability")
    
    # 3. Daily Revenue APIs
    print("\n💰 Daily Revenue APIs:")
    test_api(f"{BASE_URL}/reports/daily-revenue/daily_summary/", {"start_date": start_date, "end_date": end_date}, "Daily Summary")
    test_api(f"{BASE_URL}/reports/daily-revenue/daily_breakdown/", {"start_date": start_date, "end_date": end_date}, "Daily Breakdown")
    test_api(f"{BASE_URL}/reports/daily-revenue/calculate_daily_revenue/", {"start_date": start_date, "end_date": end_date}, "Calculate Daily Revenue")
    test_api(f"{BASE_URL}/reports/daily-revenue/inventory_analysis/", {"days": 30}, "Inventory Analysis")
    test_api(f"{BASE_URL}/reports/daily-revenue/revenue_forecast/", {"days": 7}, "Revenue Forecast")
    test_api(f"{BASE_URL}/reports/daily-revenue/top_products/", {"days": 30, "limit": 10}, "Top Products")
    test_api(f"{BASE_URL}/reports/daily-revenue/store_performance/", {"days": 30}, "Store Performance")
    
    # 4. Top Products & Customers
    print("\n🏆 Top Products & Customers:")
    test_api(f"{BASE_URL}/reports/top-products/", {"limit": 10}, "Top Products")
    test_api(f"{BASE_URL}/reports/top-customers/", {"limit": 10}, "Top Customers")
    test_api(f"{BASE_URL}/reports/best-selling/", {"limit": 10}, "Best Selling")
    
    # 5. Revenue APIs
    print("\n📈 Revenue APIs:")
    test_api(f"{BASE_URL}/reports/revenue/profit_analysis/", {"store_id": ""}, "Profit Analysis")
    
    print("\n" + "=" * 60)
    print("🎉 Testing completed!")

if __name__ == "__main__":
    test_all_reports() 