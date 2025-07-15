#!/usr/bin/env python
"""
Test script kiểm tra tính toán COGS
"""
import os
import sys
import django

# Thêm đường dẫn project vào sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Cấu hình Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from decimal import Decimal

def test_cogs_calculation():
    """Test tính toán COGS"""
    
    print("🔍 Kiểm tra tính toán COGS...")
    
    with connection.cursor() as cursor:
        # 1. Kiểm tra dữ liệu đơn hàng
        print("\n📊 1. Dữ liệu đơn hàng:")
        cursor.execute("""
            SELECT COUNT(DISTINCT o.id) as total_orders,
                   SUM(o.total_amount) as gross_revenue,
                   SUM(od.quantity) as total_items,
                   COUNT(DISTINCT od.product_variant_id) as unique_products
            FROM orders o
            LEFT JOIN orderdetail od ON o.id = od.order_id AND od.is_deleted = FALSE
            WHERE o.order_date >= '2025-01-01' 
                AND o.order_date <= '2025-07-16' 
                AND o.status IN ('delivered', 'completed')
                AND o.is_deleted = FALSE
        """)
        order_result = cursor.fetchone()
        
        if order_result:
            total_orders, gross_revenue, total_items, unique_products = order_result
            print(f"   - Tổng đơn hàng: {total_orders}")
            print(f"   - Doanh thu gộp: {gross_revenue or 0:,.0f} VNĐ")
            print(f"   - Tổng sản phẩm bán: {total_items or 0}")
            print(f"   - Số sản phẩm khác nhau: {unique_products}")
        
        # 2. Kiểm tra dữ liệu nhập kho
        print("\n📦 2. Dữ liệu nhập kho:")
        cursor.execute("""
            SELECT COUNT(DISTINCT gr.id) as total_receipts,
                   SUM(grd.accepted_quantity) as total_received_qty,
                   SUM(grd.unit_price * grd.accepted_quantity) as total_cost,
                   COUNT(DISTINCT grd.product_variant_id) as unique_products
            FROM goods_receipts gr
            JOIN goods_receipt_details grd ON gr.id = grd.goods_receipt_id
            WHERE gr.status IN ('confirmed', 'completed')
                AND gr.is_deleted = FALSE
                AND grd.is_deleted = FALSE
                AND grd.accepted_quantity > 0
        """)
        receipt_result = cursor.fetchone()
        
        if receipt_result:
            total_receipts, total_received_qty, total_cost, unique_products = receipt_result
            print(f"   - Tổng phiếu nhập: {total_receipts}")
            print(f"   - Tổng số lượng nhập: {total_received_qty or 0}")
            print(f"   - Tổng giá vốn: {total_cost or 0:,.0f} VNĐ")
            print(f"   - Số sản phẩm khác nhau: {unique_products}")
        
        # 3. Kiểm tra chi tiết sản phẩm bán
        print("\n🛍️ 3. Chi tiết sản phẩm bán:")
        cursor.execute("""
            SELECT od.product_variant_id,
                   SUM(od.quantity) as total_sold_qty,
                   SUM(od.final_price) as total_revenue
            FROM orders o
            JOIN orderdetail od ON o.id = od.order_id AND od.is_deleted = FALSE
            WHERE o.order_date >= '2025-01-01' 
                AND o.order_date <= '2025-07-16' 
                AND o.status IN ('delivered', 'completed')
                AND o.is_deleted = FALSE
            GROUP BY od.product_variant_id
            ORDER BY total_sold_qty DESC
            LIMIT 10
        """)
        sold_products = cursor.fetchall()
        
        print("   Top 10 sản phẩm bán chạy:")
        for i, (variant_id, sold_qty, revenue) in enumerate(sold_products, 1):
            print(f"   {i}. Variant ID {variant_id}: {sold_qty} sản phẩm, {revenue:,.0f} VNĐ")
        
        # 4. Kiểm tra chi tiết giá vốn từng sản phẩm
        print("\n💰 4. Chi tiết giá vốn từng sản phẩm:")
        cursor.execute("""
            SELECT grd.product_variant_id,
                   SUM(grd.accepted_quantity) as total_qty,
                   SUM(grd.unit_price * grd.accepted_quantity) as total_cost,
                   AVG(grd.unit_price) as avg_cost
            FROM goods_receipt_details grd
            JOIN goods_receipts gr ON grd.goods_receipt_id = gr.id
            WHERE gr.status IN ('confirmed', 'completed')
                AND gr.is_deleted = FALSE
                AND grd.is_deleted = FALSE
                AND grd.accepted_quantity > 0
            GROUP BY grd.product_variant_id
            ORDER BY total_cost DESC
            LIMIT 10
        """)
        cost_products = cursor.fetchall()
        
        print("   Top 10 sản phẩm có giá vốn cao nhất:")
        for i, (variant_id, total_qty, total_cost, avg_cost) in enumerate(cost_products, 1):
            print(f"   {i}. Variant ID {variant_id}: {total_qty} sản phẩm, {total_cost:,.0f} VNĐ, giá TB {avg_cost:,.0f} VNĐ")
        
        # 5. Tính COGS theo phương pháp mới
        print("\n🧮 5. Tính COGS theo phương pháp bình quân gia quyền:")
        cogs_query = """
            WITH sold_products AS (
                SELECT 
                    od.product_variant_id,
                    SUM(od.quantity) as total_sold_qty
                FROM orders o
                JOIN orderdetail od ON o.id = od.order_id AND od.is_deleted = FALSE
                WHERE o.order_date >= '2025-01-01' 
                    AND o.order_date <= '2025-07-16' 
                    AND o.status IN ('delivered', 'completed')
                    AND o.is_deleted = FALSE
                GROUP BY od.product_variant_id
            ),
            product_costs AS (
                SELECT 
                    grd.product_variant_id,
                    SUM(grd.unit_price * grd.accepted_quantity) as total_cost,
                    SUM(grd.accepted_quantity) as total_qty
                FROM goods_receipt_details grd
                JOIN goods_receipts gr ON grd.goods_receipt_id = gr.id
                WHERE gr.status IN ('confirmed', 'completed')
                    AND gr.is_deleted = FALSE
                    AND grd.is_deleted = FALSE
                    AND grd.accepted_quantity > 0
                GROUP BY grd.product_variant_id
            )
            SELECT 
                sp.product_variant_id,
                sp.total_sold_qty,
                pc.total_cost,
                pc.total_qty,
                CASE 
                    WHEN pc.total_qty > 0 THEN 
                        (sp.total_sold_qty * pc.total_cost / pc.total_qty)
                    ELSE 0 
                END as cogs_line
            FROM sold_products sp
            LEFT JOIN product_costs pc ON sp.product_variant_id = pc.product_variant_id
            ORDER BY cogs_line DESC
        """
        cursor.execute(cogs_query)
        cogs_details = cursor.fetchall()
        
        total_cogs = 0
        print("   Chi tiết COGS từng sản phẩm:")
        for variant_id, sold_qty, total_cost, total_qty, cogs_line in cogs_details:
            total_cogs += cogs_line or 0
            avg_cost = (total_cost / total_qty) if total_qty else 0
            print(f"   - Variant ID {variant_id}: Bán {sold_qty}, Giá TB {avg_cost:,.0f}, COGS {cogs_line:,.0f}")
        
        print(f"\n💰 Tổng COGS: {total_cogs:,.0f} VNĐ")
        
        # 6. So sánh với doanh thu
        if order_result and receipt_result:
            gross_revenue = order_result[1] or 0
            net_revenue = gross_revenue  # Giả sử không có giảm giá
            gross_profit = net_revenue - total_cogs
            profit_margin = (gross_profit / net_revenue * 100) if net_revenue else 0
            
            print(f"\n📈 6. Phân tích lãi gộp:")
            print(f"   - Doanh thu gộp: {gross_revenue:,.0f} VNĐ")
            print(f"   - Doanh thu ròng: {net_revenue:,.0f} VNĐ")
            print(f"   - Giá vốn: {total_cogs:,.0f} VNĐ")
            print(f"   - Lãi gộp: {gross_profit:,.0f} VNĐ")
            print(f"   - Tỷ lệ lãi gộp: {profit_margin:.2f}%")
            
            # Kiểm tra logic
            calculated_profit = net_revenue - total_cogs
            if abs(calculated_profit - gross_profit) < 0.01:
                print("   ✅ Công thức tính lãi gộp chính xác")
            else:
                print(f"   ❌ Lỗi công thức: {calculated_profit:,.0f} != {gross_profit:,.0f}")
    
    return True

if __name__ == "__main__":
    print("🚀 Bắt đầu kiểm tra tính toán COGS...")
    success = test_cogs_calculation()
    if success:
        print("\n✅ Kiểm tra hoàn tất!")
    else:
        print("\n❌ Có lỗi trong quá trình kiểm tra!") 