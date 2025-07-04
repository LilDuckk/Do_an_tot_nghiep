# TỔNG HỢP API REPORTS - WATCH STORE

## Tổng quan
Module Reports cung cấp các API để tạo báo cáo và phân tích dữ liệu kinh doanh của hệ thống Watch Store.

## Base URL
```
/api/reports/
```

## Authentication
Tất cả các API đều yêu cầu authentication và permission:
- `IsSuperUser()` hoặc `IsStoreEmployee()`

## 1. DASHBOARD API

### 1.1 Tổng quan Dashboard
**Endpoint:** `GET /api/reports/dashboard/overview/`

**Query Parameters:**
- `period` (optional): `today`, `week`, `month`, `year` (default: `today`)
- `store_id` (optional): ID cửa hàng để lọc

**Response mẫu:**
```json
{
  "period": {
    "type": "today",
    "start_date": "2024-01-15T00:00:00+07:00",
    "end_date": "2024-01-15T23:59:59+07:00"
  },
  "revenue": {
    "gross_revenue": 15000000.0,
    "net_revenue": 14250000.0,
    "total_discounts": 750000.0,
    "discount_rate": 5.0,
    "revenue_growth": 12.5
  },
  "orders": {
    "total_orders": 45,
    "total_items": 120,
    "total_customers": 38,
    "average_order_value": 333333.33,
    "order_growth": 8.2
  },
  "order_status": {
    "pending": {
      "count": 5,
      "total_amount": 2500000.0
    },
    "processing": {
      "count": 8,
      "total_amount": 4000000.0
    },
    "delivered": {
      "count": 32,
      "total_amount": 15000000.0
    }
  },
  "inventory": {
    "total_products": 150,
    "total_stock": 2500,
    "out_of_stock_count": 3,
    "low_stock_count": 12
  }
}
```

### 1.2 Hoạt động gần đây
**Endpoint:** `GET /api/reports/dashboard/recent_activity/`

**Query Parameters:**
- `limit` (optional): Số lượng hoạt động (default: 10)
- `store_id` (optional): ID cửa hàng

**Response mẫu:**
```json
{
  "recent_orders": [
    {
      "order_id": 1234,
      "customer_name": "Nguyễn Văn A",
      "total_amount": 2500000.0,
      "status": "delivered",
      "order_date": "2024-01-15T14:30:00+07:00"
    }
  ],
  "recent_returns": [
    {
      "return_id": 567,
      "order_id": 1234,
      "customer_name": "Trần Thị B",
      "refund_amount": 1500000.0,
      "status": "completed",
      "return_date": "2024-01-15T16:45:00+07:00"
    }
  ],
  "recent_warranties": [
    {
      "warranty_id": 890,
      "product_name": "Đồng hồ Rolex Submariner",
      "customer_name": "Lê Văn C",
      "status": "in_progress",
      "created_date": "2024-01-15T10:15:00+07:00"
    }
  ]
}
```

### 1.3 Cảnh báo
**Endpoint:** `GET /api/reports/dashboard/alerts/`

**Response mẫu:**
```json
{
  "low_stock_alerts": [
    {
      "product_variant_id": 123,
      "product_name": "Đồng hồ Casio G-Shock",
      "current_stock": 2,
      "min_stock": 5,
      "store_name": "Chi nhánh Hà Nội"
    }
  ],
  "expired_warranties": [
    {
      "warranty_id": 456,
      "product_name": "Đồng hồ Omega Speedmaster",
      "customer_name": "Phạm Thị D",
      "expiry_date": "2024-01-20",
      "days_remaining": 5
    }
  ],
  "pending_returns": [
    {
      "return_id": 789,
      "order_id": 2345,
      "customer_name": "Hoàng Văn E",
      "return_date": "2024-01-14T09:30:00+07:00",
      "status": "pending"
    }
  ]
}
```

## 2. SALES ANALYSIS API

### 2.1 Sản phẩm bán chạy
**Endpoint:** `GET /api/reports/sales/best_sellers/`

**Query Parameters:**
- `start_date` (optional): Ngày bắt đầu (YYYY-MM-DD)
- `end_date` (optional): Ngày kết thúc (YYYY-MM-DD)
- `store_id` (optional): ID cửa hàng
- `limit` (optional): Số lượng sản phẩm (default: 10)

**Response mẫu:**
```json
{
  "summary": {
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    },
    "total_products": 10,
    "total_quantity_sold": 150,
    "total_revenue": 45000000.0,
    "total_net_revenue": 42750000.0,
    "total_discounts": 2250000.0,
    "average_revenue_per_product": 4500000.0
  },
  "best_sellers": [
    {
      "product_variant_id": 123,
      "sku": "CASIO-GSHOCK-001",
      "product_name": "Đồng hồ Casio G-Shock",
      "brand_name": "Casio",
      "total_quantity": 25,
      "total_revenue": 12500000.0,
      "total_orders": 20,
      "average_price": 500000.0,
      "total_discount": 625000.0,
      "net_revenue": 11875000.0,
      "current_stock": 15,
      "gross_profit_margin": 0.0,
      "revenue_per_order": 625000.0
    }
  ]
}
```

### 2.2 Hiệu suất bán hàng theo thời gian
**Endpoint:** `GET /api/reports/sales/sales_performance_by_time/`

**Query Parameters:**
- `start_date` (optional): Ngày bắt đầu
- `end_date` (optional): Ngày kết thúc
- `store_id` (optional): ID cửa hàng
- `product_variant_id` (optional): ID sản phẩm
- `period_type` (optional): `daily`, `weekly`, `monthly` (default: `daily`)

**Response mẫu:**
```json
{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "period_type": "daily"
  },
  "performance_data": [
    {
      "period": "2024-01-01",
      "total_orders": 15,
      "total_revenue": 7500000.0,
      "total_quantity": 45,
      "average_order_value": 500000.0,
      "total_discounts": 375000.0,
      "net_revenue": 7125000.0
    }
  ],
  "summary": {
    "total_orders": 450,
    "total_revenue": 225000000.0,
    "total_quantity": 1350,
    "average_order_value": 500000.0,
    "total_discounts": 11250000.0,
    "net_revenue": 213750000.0
  }
}
```

### 2.3 Tốc độ luân chuyển tồn kho
**Endpoint:** `GET /api/reports/sales/inventory_turnover/`

**Query Parameters:**
- `start_date` (optional): Ngày bắt đầu
- `end_date` (optional): Ngày kết thúc
- `store_id` (optional): ID cửa hàng

**Response mẫu:**
```json
{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "turnover_data": [
    {
      "product_variant_id": 123,
      "sku": "CASIO-GSHOCK-001",
      "product_name": "Đồng hồ Casio G-Shock",
      "brand_name": "Casio",
      "beginning_stock": 50,
      "ending_stock": 15,
      "total_sold": 35,
      "average_stock": 32.5,
      "turnover_rate": 1.08,
      "days_to_sell": 28.7
    }
  ],
  "summary": {
    "average_turnover_rate": 1.2,
    "fast_moving_products": 25,
    "slow_moving_products": 8,
    "total_products_analyzed": 150
  }
}
```

## 3. REVENUE REPORT API

### 3.1 Doanh thu theo ngày
**Endpoint:** `GET /api/reports/revenue/daily_revenue/`

**Query Parameters:**
- `start_date` (optional): Ngày bắt đầu
- `end_date` (optional): Ngày kết thúc
- `store_id` (optional): ID cửa hàng

**Response mẫu:**
```json
{
  "summary": {
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    },
    "total_orders": 450,
    "total_gross_revenue": 225000000.0,
    "total_net_revenue": 213750000.0,
    "total_discounts": 11250000.0,
    "total_coupon_discounts": 6750000.0,
    "total_items": 1350,
    "total_customers": 380,
    "average_order_value": 500000.0,
    "average_discount_rate": 5.0
  },
  "daily_data": [
    {
      "date": "2024-01-01",
      "total_orders": 15,
      "gross_revenue": 7500000.0,
      "net_revenue": 7125000.0,
      "total_discounts": 375000.0,
      "coupon_discounts": 225000.0,
      "total_items": 45,
      "total_customers": 12,
      "average_order_value": 500000.0,
      "discount_rate": 5.0
    }
  ]
}
```

### 3.2 Doanh thu theo tháng
**Endpoint:** `GET /api/reports/revenue/monthly_revenue/`

**Query Parameters:**
- `year` (optional): Năm (default: năm hiện tại)
- `store_id` (optional): ID cửa hàng

**Response mẫu:**
```json
{
  "summary": {
    "year": 2024,
    "total_orders": 5400,
    "total_gross_revenue": 2700000000.0,
    "total_net_revenue": 2565000000.0,
    "total_discounts": 135000000.0,
    "total_coupon_discounts": 81000000.0,
    "total_items": 16200,
    "total_customers": 4560,
    "average_order_value": 500000.0,
    "average_discount_rate": 5.0
  },
  "monthly_data": [
    {
      "month": 1,
      "total_orders": 450,
      "gross_revenue": 225000000.0,
      "net_revenue": 213750000.0,
      "total_discounts": 11250000.0,
      "coupon_discounts": 6750000.0,
      "total_items": 1350,
      "total_customers": 380,
      "average_order_value": 500000.0,
      "discount_rate": 5.0
    }
  ]
}
```

### 3.3 Phân tích lợi nhuận
**Endpoint:** `GET /api/reports/revenue/profit_analysis/`

**Query Parameters:**
- `start_date` (optional): Ngày bắt đầu
- `end_date` (optional): Ngày kết thúc
- `store_id` (optional): ID cửa hàng

**Response mẫu:**
```json
{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "profit_summary": {
    "total_revenue": 225000000.0,
    "total_cost": 157500000.0,
    "total_profit": 67500000.0,
    "profit_margin": 30.0,
    "average_profit_per_order": 150000.0
  },
  "profit_by_product": [
    {
      "product_variant_id": 123,
      "sku": "CASIO-GSHOCK-001",
      "product_name": "Đồng hồ Casio G-Shock",
      "total_revenue": 12500000.0,
      "total_cost": 8750000.0,
      "total_profit": 3750000.0,
      "profit_margin": 30.0,
      "quantity_sold": 25
    }
  ],
  "profit_by_category": [
    {
      "category_name": "Đồng hồ thể thao",
      "total_revenue": 75000000.0,
      "total_cost": 52500000.0,
      "total_profit": 22500000.0,
      "profit_margin": 30.0
    }
  ]
}
```

## 4. RETURN & WARRANTY REPORT API

### 4.1 Tổng hợp Return Orders
**Endpoint:** `GET /api/reports/return-warranty-report/return_summary/`

**Query Parameters:**
- `start_date` (optional): Ngày bắt đầu
- `end_date` (optional): Ngày kết thúc
- `store_id` (optional): ID cửa hàng

**Response mẫu:**
```json
{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "summary": {
    "total_return_orders": 25,
    "total_returned_items": 35,
    "total_returned_quantity": 40,
    "total_refund_amount": 15000000.0,
    "average_refund_amount": 600000.0,
    "cross_store_returns": 3
  },
  "status_breakdown": {
    "pending": 5,
    "approved": 8,
    "completed": 10,
    "rejected": 2
  },
  "product_analysis": [
    {
      "product_variant_id": 123,
      "sku": "CASIO-GSHOCK-001",
      "product_name": "Đồng hồ Casio G-Shock",
      "brand_name": "Casio",
      "return_orders_count": 3,
      "total_returned_quantity": 4,
      "total_refund_amount": 2000000.0,
      "total_orders_count": 20,
      "total_sold_quantity": 25,
      "return_rate": 16.0
    }
  ],
  "reason_analysis": [
    {
      "reason": "Sản phẩm bị lỗi",
      "return_orders_count": 12,
      "total_returned_quantity": 18,
      "total_refund_amount": 7200000.0
    },
    {
      "reason": "Không vừa ý",
      "return_orders_count": 8,
      "total_returned_quantity": 12,
      "total_refund_amount": 4800000.0
    }
  ]
}
```

### 4.2 Tổng hợp Warranty
**Endpoint:** `GET /api/reports/return-warranty-report/warranty_summary/`

**Query Parameters:**
- `start_date` (optional): Ngày bắt đầu
- `end_date` (optional): Ngày kết thúc
- `store_id` (optional): ID cửa hàng

**Response mẫu:**
```json
{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "summary": {
    "total_warranties": 45,
    "total_warranty_claims": 15,
    "total_repair_cost": 7500000.0,
    "average_repair_cost": 500000.0,
    "warranty_claim_rate": 33.33
  },
  "status_breakdown": {
    "pending": 8,
    "in_progress": 5,
    "completed": 10,
    "rejected": 2
  },
  "warranty_analysis": [
    {
      "product_variant_id": 123,
      "sku": "CASIO-GSHOCK-001",
      "product_name": "Đồng hồ Casio G-Shock",
      "brand_name": "Casio",
      "warranty_count": 5,
      "warranty_claim_count": 2,
      "total_repair_cost": 1000000.0,
      "claim_rate": 40.0
    }
  ],
  "repair_cost_analysis": [
    {
      "repair_type": "Thay pin",
      "claim_count": 8,
      "total_cost": 4000000.0,
      "average_cost": 500000.0
    },
    {
      "repair_type": "Sửa chữa màn hình",
      "claim_count": 5,
      "total_cost": 2500000.0,
      "average_cost": 500000.0
    }
  ]
}
```

### 4.3 Tác động tài chính
**Endpoint:** `GET /api/reports/return-warranty-report/financial_impact/`

**Query Parameters:**
- `start_date` (optional): Ngày bắt đầu
- `end_date` (optional): Ngày kết thúc
- `store_id` (optional): ID cửa hàng

**Response mẫu:**
```json
{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "financial_impact": {
    "total_revenue": 225000000.0,
    "total_returns": 15000000.0,
    "total_warranty_costs": 7500000.0,
    "net_revenue": 202500000.0,
    "return_rate": 6.67,
    "warranty_cost_rate": 3.33,
    "total_impact": 22500000.0,
    "impact_percentage": 10.0
  },
  "monthly_trend": [
    {
      "month": "2024-01",
      "revenue": 225000000.0,
      "returns": 15000000.0,
      "warranty_costs": 7500000.0,
      "net_revenue": 202500000.0
    }
  ],
  "product_impact": [
    {
      "product_variant_id": 123,
      "sku": "CASIO-GSHOCK-001",
      "product_name": "Đồng hồ Casio G-Shock",
      "revenue": 12500000.0,
      "returns": 2000000.0,
      "warranty_costs": 1000000.0,
      "net_revenue": 9500000.0,
      "impact_percentage": 24.0
    }
  ]
}
```

## 5. DAILY REVENUE API

### 5.1 Tính toán doanh thu theo ngày
**Endpoint:** `GET /api/reports/daily-revenue/calculate_daily_revenue/`

**Query Parameters:**
- `start_date` (optional): Ngày bắt đầu
- `end_date` (optional): Ngày kết thúc
- `store` (optional): ID cửa hàng

**Response mẫu:**
```json
{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
  "daily_revenues": [
    {
      "date": "2024-01-01",
      "order_revenue": 7500000.0,
      "order_count": 15,
      "sold_products": 45,
      "inventory_out_quantity": 45,
      "inventory_out_value": 7500000.0
    }
  ],
  "summary": {
    "total_revenue": 225000000.0,
    "total_orders": 450,
    "total_products_sold": 1350
  }
}
```

### 5.2 Phân tích tồn kho
**Endpoint:** `GET /api/reports/daily-revenue/inventory_analysis/`

**Query Parameters:**
- `store` (optional): ID cửa hàng
- `days` (optional): Số ngày phân tích (default: 30)

**Response mẫu:**
```json
{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "days": 31
  },
  "transaction_statistics": [
    {
      "transaction_type": "IN",
      "count": 25,
      "total_quantity": 500,
      "total_value": 25000000.0
    },
    {
      "transaction_type": "OUT",
      "count": 450,
      "total_quantity": 1350,
      "total_value": 225000000.0
    }
  ],
  "product_statistics": [
    {
      "inventory__product_variant__sku": "CASIO-GSHOCK-001",
      "inventory__product_variant__product__name": "Đồng hồ Casio G-Shock",
      "in_quantity": 50,
      "out_quantity": 25,
      "in_value": 2500000.0,
      "out_value": 12500000.0
    }
  ],
  "store_statistics": [
    {
      "inventory__store__name": "Chi nhánh Hà Nội",
      "in_quantity": 500,
      "out_quantity": 1350,
      "in_value": 25000000.0,
      "out_value": 225000000.0
    }
  ]
}
```

### 5.3 Dự báo doanh thu
**Endpoint:** `GET /api/reports/daily-revenue/revenue_forecast/`

**Query Parameters:**
- `days` (optional): Số ngày dự báo (default: 7)
- `store` (optional): ID cửa hàng

**Response mẫu:**
```json
{
  "forecast_period": {
    "start_date": "2024-02-01",
    "end_date": "2024-02-07",
    "days": 7
  },
  "forecast_data": [
    {
      "date": "2024-02-01",
      "predicted_revenue": 7250000.0,
      "confidence_interval": {
        "lower": 6525000.0,
        "upper": 7975000.0
      }
    }
  ],
  "forecast_summary": {
    "total_predicted_revenue": 50750000.0,
    "average_daily_revenue": 7250000.0,
    "growth_rate": 8.33
  }
}
```

## 6. TOP PRODUCTS API

### 6.1 Danh sách sản phẩm bán chạy
**Endpoint:** `GET /api/reports/top-products/`

**Query Parameters:**
- `days` (optional): Số ngày phân tích (default: 30)
- `limit` (optional): Số lượng sản phẩm (default: 10)
- `store_id` (optional): ID cửa hàng

**Response mẫu:**
```json
[
  {
    "product_id": 123,
    "sku": "CASIO-GSHOCK-001",
    "product_name": "Đồng hồ Casio G-Shock",
    "store_id": 1,
    "total_quantity": 25,
    "total_revenue": 12500000.0
  },
  {
    "product_id": 124,
    "sku": "ROLEX-SUBMARINER-001",
    "product_name": "Đồng hồ Rolex Submariner",
    "store_id": 1,
    "total_quantity": 3,
    "total_revenue": 150000000.0
  }
]
```

## 7. TOP CUSTOMERS API

### 7.1 Danh sách khách hàng hàng đầu
**Endpoint:** `GET /api/reports/top-customers/`

**Response mẫu:**
```json
[
  {
    "customer_id": 1,
    "first_name": "Nguyễn",
    "last_name": "Văn A",
    "email": "nguyenvana@email.com",
    "phone": "0123456789",
    "total_orders": 15,
    "total_spent": 75000000.0,
    "last_order_date": "2024-01-15T14:30:00+07:00"
  },
  {
    "customer_id": 2,
    "first_name": "Trần",
    "last_name": "Thị B",
    "email": "tranthib@email.com",
    "phone": "0987654321",
    "total_orders": 12,
    "total_spent": 60000000.0,
    "last_order_date": "2024-01-14T16:45:00+07:00"
  }
]
```

## 8. BEST SELLING API

### 8.1 Sản phẩm bán chạy nhất
**Endpoint:** `GET /api/reports/best-selling/`

**Query Parameters:**
- `limit` (optional): Số lượng sản phẩm (default: 10)

**Response mẫu:**
```json
[
  {
    "product_id": 123,
    "product_name": "Đồng hồ Casio G-Shock",
    "brand_name": "Casio",
    "category_name": "Đồng hồ thể thao",
    "total_orders": 20,
    "total_quantity": 25,
    "total_revenue": 12500000.0
  },
  {
    "product_id": 124,
    "product_name": "Đồng hồ Rolex Submariner",
    "brand_name": "Rolex",
    "category_name": "Đồng hồ cao cấp",
    "total_orders": 3,
    "total_quantity": 3,
    "total_revenue": 150000000.0
  }
]
```

## Lưu ý quan trọng

### Error Response Format
Tất cả các API đều trả về error response theo format:
```json
{
  "detail": "Mô tả lỗi chi tiết"
}
```

### HTTP Status Codes
- `200 OK`: Thành công
- `400 Bad Request`: Dữ liệu đầu vào không hợp lệ
- `401 Unauthorized`: Chưa đăng nhập
- `403 Forbidden`: Không có quyền truy cập
- `500 Internal Server Error`: Lỗi server

### Query Parameters chung
- `store_id`: Lọc theo cửa hàng (nếu không có sẽ lấy theo quyền của user)
- `start_date`, `end_date`: Định dạng YYYY-MM-DD
- Các tham số số lượng thường có giá trị mặc định hợp lý

### Timezone
Tất cả các timestamp đều sử dụng timezone của server (UTC+7)

### Pagination
Các API trả về danh sách dài sẽ có pagination theo chuẩn Django REST Framework
