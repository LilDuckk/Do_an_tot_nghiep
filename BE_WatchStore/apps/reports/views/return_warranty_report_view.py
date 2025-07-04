from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import connection
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from rest_framework.permissions import OR

from apps.orders.models.return_order import ReturnOrder
from apps.orders.models.return_order_detail import ReturnOrderDetail
from apps.warranty.models.warranty import Warranty
from apps.warranty.models.warranty_claim import WarrantyClaim
from apps.orders.models.order import Orders
from apps.orders.models.order_detail import OrderDetail
from apps.products.models.product import Product
from apps.products.models.variant import ProductVariant
from apps.stores.models.store import Store
from apps.stores.models.employee import Employee
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee

class ReturnWarrantyReportViewSet(viewsets.ViewSet):
    """
    ViewSet chuyên biệt cho báo cáo Return Orders và Warranty
    """
    
    def get_permissions(self):
        """Tùy chỉnh permission"""
        return [OR(IsSuperUser(), IsStoreEmployee())]

    def get_user_store_filter(self):
        """Lấy điều kiện lọc theo cửa hàng của user"""
        user = self.request.user
        
        if user.is_superuser:
            return ""
        
        try:
            employee = Employee.objects.get(user=user, is_deleted=False)
            user_store = employee.store
            return f"AND o.store_id = {user_store.id}"
        except Employee.DoesNotExist:
            return "AND 1=0"  # Không có quyền

    @action(detail=False, methods=['get'])
    def return_summary(self, request):
        """Tổng hợp thống kê return orders"""
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            store_id = request.query_params.get('store_id')
            
            if not start_date:
                start_date = (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            if not end_date:
                end_date = timezone.now().strftime('%Y-%m-%d')
            
            store_filter = ""
            if store_id:
                store_filter = f"AND o.store_id = {store_id}"
            else:
                store_filter = self.get_user_store_filter()
            
            with connection.cursor() as cursor:
                # Thống kê tổng quan return orders
                cursor.execute(f"""
                    SELECT 
                        COUNT(DISTINCT ro.id) as total_return_orders,
                        COUNT(rod.id) as total_returned_items,
                        SUM(rod.quantity) as total_returned_quantity,
                        SUM(ro.refund_amount) as total_refund_amount,
                        AVG(ro.refund_amount) as average_refund_amount,
                        COUNT(CASE WHEN ro.status = 'PENDING' THEN 1 END) as pending_returns,
                        COUNT(CASE WHEN ro.status = 'APPROVED' THEN 1 END) as approved_returns,
                        COUNT(CASE WHEN ro.status = 'COMPLETED' THEN 1 END) as completed_returns,
                        COUNT(CASE WHEN ro.status = 'REJECTED' THEN 1 END) as rejected_returns,
                        COUNT(CASE WHEN ro.return_store_id != o.store_id THEN 1 END) as cross_store_returns
                    FROM returnorder ro
                    LEFT JOIN returnorderdetail rod ON ro.id = rod.return_order_id AND rod.is_deleted = FALSE
                    LEFT JOIN orders o ON ro.order_id = o.id
                    WHERE ro.return_date >= %s 
                        AND ro.return_date <= %s 
                        AND ro.is_deleted = FALSE
                        {store_filter}
                """, [start_date, end_date])
                
                return_summary = cursor.fetchone()
                
                # Thống kê return theo sản phẩm
                cursor.execute(f"""
                    SELECT 
                        pv.id as product_variant_id,
                        pv.sku,
                        p.name as product_name,
                        b.name as brand_name,
                        COUNT(DISTINCT ro.id) as return_orders_count,
                        SUM(rod.quantity) as total_returned_quantity,
                        SUM(ro.refund_amount) as total_refund_amount,
                        COUNT(DISTINCT o.id) as total_orders_count,
                        SUM(od.quantity) as total_sold_quantity
                    FROM returnorderdetail rod
                    JOIN returnorder ro ON rod.return_order_id = ro.id AND ro.is_deleted = FALSE
                    JOIN orderdetail od ON rod.order_detail_id = od.id
                    JOIN orders o ON od.order_id = o.id
                    JOIN productvariant pv ON od.product_variant_id = pv.id
                    JOIN product p ON pv.product_id = p.id
                    LEFT JOIN brand b ON p.brand_id = b.id
                    WHERE ro.return_date >= %s 
                        AND ro.return_date <= %s 
                        AND rod.is_deleted = FALSE
                        {store_filter}
                    GROUP BY pv.id, pv.sku, p.name, b.name
                    ORDER BY total_returned_quantity DESC
                    LIMIT 20
                """, [start_date, end_date])
                
                product_returns = cursor.fetchall()
                
                # Thống kê return theo lý do
                cursor.execute(f"""
                    SELECT 
                        rod.reason,
                        COUNT(DISTINCT ro.id) as return_orders_count,
                        SUM(rod.quantity) as total_returned_quantity,
                        SUM(ro.refund_amount) as total_refund_amount
                    FROM returnorderdetail rod
                    JOIN returnorder ro ON rod.return_order_id = ro.id AND ro.is_deleted = FALSE
                    LEFT JOIN orders o ON ro.order_id = o.id
                    WHERE ro.return_date >= %s 
                        AND ro.return_date <= %s 
                        AND rod.is_deleted = FALSE
                        AND rod.reason IS NOT NULL
                        {store_filter}
                    GROUP BY rod.reason
                    ORDER BY total_returned_quantity DESC
                """, [start_date, end_date])
                
                reason_returns = cursor.fetchall()
            
            # Xử lý kết quả tổng quan
            (total_return_orders, total_returned_items, total_returned_quantity, total_refund_amount,
             average_refund_amount, pending_returns, approved_returns, completed_returns, 
             rejected_returns, cross_store_returns) = return_summary
            
            # Xử lý kết quả theo sản phẩm
            product_analysis = []
            for row in product_returns:
                (product_variant_id, sku, product_name, brand_name, return_orders_count,
                 total_returned_quantity, total_refund_amount, total_orders_count, total_sold_quantity) = row
                
                return_rate = (total_returned_quantity / total_sold_quantity * 100) if total_sold_quantity else 0
                
                product_analysis.append({
                    'product_variant_id': product_variant_id,
                    'sku': sku,
                    'product_name': product_name,
                    'brand_name': brand_name,
                    'return_orders_count': return_orders_count or 0,
                    'total_returned_quantity': total_returned_quantity or 0,
                    'total_refund_amount': float(total_refund_amount or 0),
                    'total_orders_count': total_orders_count or 0,
                    'total_sold_quantity': total_sold_quantity or 0,
                    'return_rate': float(return_rate)
                })
            
            # Xử lý kết quả theo lý do
            reason_analysis = []
            for row in reason_returns:
                reason, return_orders_count, total_returned_quantity, total_refund_amount = row
                reason_analysis.append({
                    'reason': reason,
                    'return_orders_count': return_orders_count or 0,
                    'total_returned_quantity': total_returned_quantity or 0,
                    'total_refund_amount': float(total_refund_amount or 0)
                })
            
            return Response({
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'summary': {
                    'total_return_orders': total_return_orders or 0,
                    'total_returned_items': total_returned_items or 0,
                    'total_returned_quantity': total_returned_quantity or 0,
                    'total_refund_amount': float(total_refund_amount or 0),
                    'average_refund_amount': float(average_refund_amount or 0),
                    'cross_store_returns': cross_store_returns or 0
                },
                'status_breakdown': {
                    'pending': pending_returns or 0,
                    'approved': approved_returns or 0,
                    'completed': completed_returns or 0,
                    'rejected': rejected_returns or 0
                },
                'product_analysis': product_analysis,
                'reason_analysis': reason_analysis
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def warranty_summary(self, request):
        """Tổng hợp thống kê warranty"""
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            store_id = request.query_params.get('store_id')
            
            if not start_date:
                start_date = (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            if not end_date:
                end_date = timezone.now().strftime('%Y-%m-%d')
            
            store_filter = ""
            if store_id:
                store_filter = f"AND o.store_id = {store_id}"
            else:
                store_filter = self.get_user_store_filter()
            
            with connection.cursor() as cursor:
                # Thống kê tổng quan warranty
                cursor.execute(f"""
                    SELECT 
                        COUNT(DISTINCT w.id) as total_warranties,
                        COUNT(DISTINCT wc.id) as total_warranty_claims,
                        SUM(wc.repair_cost) as total_repair_cost,
                        AVG(wc.repair_cost) as average_repair_cost,
                        COUNT(CASE WHEN w.status = 'ACTIVE' THEN 1 END) as active_warranties,
                        COUNT(CASE WHEN w.status = 'EXPIRED' THEN 1 END) as expired_warranties,
                        COUNT(CASE WHEN w.status = 'CLAIMED' THEN 1 END) as claimed_warranties,
                        COUNT(CASE WHEN wc.status = 'PENDING' THEN 1 END) as pending_claims,
                        COUNT(CASE WHEN wc.status = 'IN_PROGRESS' THEN 1 END) as in_progress_claims,
                        COUNT(CASE WHEN wc.status = 'COMPLETED' THEN 1 END) as completed_claims,
                        COUNT(CASE WHEN wc.status = 'REJECTED' THEN 1 END) as rejected_claims
                    FROM warranty w
                    LEFT JOIN warrantyclaim wc ON w.id = wc.warranty_id AND wc.is_deleted = FALSE
                    LEFT JOIN orderdetail od ON w.order_detail_id = od.id
                    LEFT JOIN orders o ON od.order_id = o.id
                    WHERE w.warranty_start_date >= %s 
                        AND w.warranty_start_date <= %s 
                        AND w.is_deleted = FALSE
                        {store_filter}
                """, [start_date, end_date])
                
                warranty_summary = cursor.fetchone()
                
                # Thống kê warranty theo sản phẩm
                cursor.execute(f"""
                    SELECT 
                        pv.id as product_variant_id,
                        pv.sku,
                        p.name as product_name,
                        b.name as brand_name,
                        COUNT(DISTINCT w.id) as total_warranties,
                        COUNT(DISTINCT wc.id) as total_claims,
                        SUM(wc.repair_cost) as total_repair_cost,
                        COUNT(DISTINCT o.id) as total_orders,
                        SUM(od.quantity) as total_sold_quantity
                    FROM warranty w
                    LEFT JOIN warrantyclaim wc ON w.id = wc.warranty_id AND wc.is_deleted = FALSE
                    JOIN orderdetail od ON w.order_detail_id = od.id
                    JOIN orders o ON od.order_id = o.id
                    JOIN productvariant pv ON od.product_variant_id = pv.id
                    JOIN product p ON pv.product_id = p.id
                    LEFT JOIN brand b ON p.brand_id = b.id
                    WHERE w.warranty_start_date >= %s 
                        AND w.warranty_start_date <= %s 
                        AND w.is_deleted = FALSE
                        {store_filter}
                    GROUP BY pv.id, pv.sku, p.name, b.name
                    ORDER BY total_claims DESC
                    LIMIT 20
                """, [start_date, end_date])
                
                product_warranties = cursor.fetchall()
                
                # Thống kê warranty claims theo thời gian xử lý
                cursor.execute(f"""
                    SELECT 
                        wc.id,
                        wc.claim_date,
                        wc.completed_date,
                        wc.repair_cost,
                        wc.status,
                        p.name as product_name,
                        pv.sku
                    FROM warrantyclaim wc
                    JOIN warranty w ON wc.warranty_id = w.id
                    JOIN orderdetail od ON w.order_detail_id = od.id
                    JOIN orders o ON od.order_id = o.id
                    JOIN productvariant pv ON od.product_variant_id = pv.id
                    JOIN product p ON pv.product_id = p.id
                    WHERE wc.claim_date >= %s 
                        AND wc.claim_date <= %s 
                        AND wc.is_deleted = FALSE
                        {store_filter}
                    ORDER BY wc.claim_date DESC
                    LIMIT 50
                """, [start_date, end_date])
                
                claim_details = cursor.fetchall()
            
            # Xử lý kết quả tổng quan
            (total_warranties, total_warranty_claims, total_repair_cost, average_repair_cost,
             active_warranties, expired_warranties, claimed_warranties, pending_claims,
             in_progress_claims, completed_claims, rejected_claims) = warranty_summary
            
            # Xử lý kết quả theo sản phẩm
            product_analysis = []
            for row in product_warranties:
                (product_variant_id, sku, product_name, brand_name, total_warranties,
                 total_claims, total_repair_cost, total_orders, total_sold_quantity) = row
                
                claim_rate = (total_claims / total_warranties * 100) if total_warranties else 0
                
                product_analysis.append({
                    'product_variant_id': product_variant_id,
                    'sku': sku,
                    'product_name': product_name,
                    'brand_name': brand_name,
                    'total_warranties': total_warranties or 0,
                    'total_claims': total_claims or 0,
                    'total_repair_cost': float(total_repair_cost or 0),
                    'total_orders': total_orders or 0,
                    'total_sold_quantity': total_sold_quantity or 0,
                    'claim_rate': float(claim_rate)
                })
            
            # Xử lý chi tiết claims
            claim_analysis = []
            for row in claim_details:
                claim_id, claim_date, completed_date, repair_cost, claim_status, product_name, sku = row
                
                processing_days = 0
                if completed_date and claim_date:
                    processing_days = (completed_date - claim_date).days
                
                claim_analysis.append({
                    'claim_id': claim_id,
                    'claim_date': claim_date.isoformat() if claim_date else None,
                    'completed_date': completed_date.isoformat() if completed_date else None,
                    'processing_days': processing_days,
                    'repair_cost': float(repair_cost or 0),
                    'status': claim_status,
                    'product_name': product_name,
                    'sku': sku
                })
            
            return Response({
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'summary': {
                    'total_warranties': total_warranties or 0,
                    'total_warranty_claims': total_warranty_claims or 0,
                    'total_repair_cost': float(total_repair_cost or 0),
                    'average_repair_cost': float(average_repair_cost or 0),
                    'claim_rate': (total_warranty_claims / total_warranties * 100) if total_warranties else 0
                },
                'warranty_status': {
                    'active': active_warranties or 0,
                    'expired': expired_warranties or 0,
                    'claimed': claimed_warranties or 0
                },
                'claim_status': {
                    'pending': pending_claims or 0,
                    'in_progress': in_progress_claims or 0,
                    'completed': completed_claims or 0,
                    'rejected': rejected_claims or 0
                },
                'product_analysis': product_analysis,
                'claim_details': claim_analysis
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def financial_impact(self, request):
        """Phân tích tác động tài chính của return orders và warranty"""
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            store_id = request.query_params.get('store_id')
            
            if not start_date:
                start_date = (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            if not end_date:
                end_date = timezone.now().strftime('%Y-%m-%d')
            
            store_filter = ""
            if store_id:
                store_filter = f"AND o.store_id = {store_id}"
            else:
                store_filter = self.get_user_store_filter()
            
            with connection.cursor() as cursor:
                # Tổng hợp tác động tài chính
                cursor.execute(f"""
                    SELECT 
                        -- Doanh thu
                        SUM(o.total_amount) as total_revenue,
                        COUNT(DISTINCT o.id) as total_orders,
                        SUM(od.quantity) as total_items_sold,
                        
                        -- Return impact
                        SUM(COALESCE(ro.refund_amount, 0)) as total_refund_amount,
                        COUNT(DISTINCT ro.id) as total_return_orders,
                        SUM(COALESCE(rod.quantity, 0)) as total_returned_quantity,
                        
                        -- Warranty impact
                        SUM(COALESCE(wc.repair_cost, 0)) as total_repair_cost,
                        COUNT(DISTINCT wc.id) as total_warranty_claims,
                        
                        -- Purchase cost (ước tính)
                        SUM(od.final_price * 0.6) as estimated_purchase_cost
                    FROM orders o
                    LEFT JOIN orderdetail od ON o.id = od.order_id AND od.is_deleted = FALSE
                    LEFT JOIN returnorderdetail rod ON od.id = rod.order_detail_id AND rod.is_deleted = FALSE
                    LEFT JOIN returnorder ro ON rod.return_order_id = ro.id AND ro.is_deleted = FALSE
                    LEFT JOIN warranty w ON od.id = w.order_detail_id AND w.is_deleted = FALSE
                    LEFT JOIN warrantyclaim wc ON w.id = wc.warranty_id AND wc.is_deleted = FALSE
                    WHERE o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        {store_filter}
                """, [start_date, end_date])
                
                financial_impact = cursor.fetchone()
                
                # Phân tích theo sản phẩm
                cursor.execute(f"""
                    SELECT 
                        pv.id as product_variant_id,
                        pv.sku,
                        p.name as product_name,
                        b.name as brand_name,
                        
                        -- Sales
                        SUM(od.quantity) as sold_quantity,
                        SUM(od.final_price) as sold_revenue,
                        
                        -- Returns
                        SUM(COALESCE(rod.quantity, 0)) as returned_quantity,
                        SUM(COALESCE(ro.refund_amount, 0)) as refund_amount,
                        
                        -- Warranty
                        COUNT(DISTINCT wc.id) as warranty_claims,
                        SUM(COALESCE(wc.repair_cost, 0)) as repair_cost,
                        
                        -- Cost estimation
                        SUM(od.final_price * 0.6) as estimated_cost
                    FROM orderdetail od
                    JOIN orders o ON od.order_id = o.id
                    JOIN productvariant pv ON od.product_variant_id = pv.id
                    JOIN product p ON pv.product_id = p.id
                    LEFT JOIN brand b ON p.brand_id = b.id
                    LEFT JOIN returnorderdetail rod ON od.id = rod.order_detail_id AND rod.is_deleted = FALSE
                    LEFT JOIN returnorder ro ON rod.return_order_id = ro.id AND ro.is_deleted = FALSE
                    LEFT JOIN warranty w ON od.id = w.order_detail_id AND w.is_deleted = FALSE
                    LEFT JOIN warrantyclaim wc ON w.id = wc.warranty_id AND wc.is_deleted = FALSE
                    WHERE o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE
                        {store_filter}
                    GROUP BY pv.id, pv.sku, p.name, b.name
                    HAVING SUM(od.quantity) > 0
                    ORDER BY sold_revenue DESC
                    LIMIT 20
                """, [start_date, end_date])
                
                product_impact = cursor.fetchall()
            
            # Xử lý kết quả tổng hợp
            (total_revenue, total_orders, total_items_sold, total_refund_amount, total_return_orders,
             total_returned_quantity, total_repair_cost, total_warranty_claims, estimated_purchase_cost) = financial_impact
            
            total_revenue = total_revenue or Decimal('0')
            total_refund_amount = total_refund_amount or Decimal('0')
            total_repair_cost = total_repair_cost or Decimal('0')
            estimated_purchase_cost = estimated_purchase_cost or Decimal('0')
            
            # Tính toán các chỉ số
            gross_profit = total_revenue - estimated_purchase_cost
            net_profit = gross_profit - total_refund_amount - total_repair_cost
            return_rate = (total_returned_quantity / total_items_sold * 100) if total_items_sold else 0
            warranty_claim_rate = (total_warranty_claims / total_orders * 100) if total_orders else 0
            
            # Xử lý kết quả theo sản phẩm
            product_analysis = []
            for row in product_impact:
                (product_variant_id, sku, product_name, brand_name, sold_quantity, sold_revenue,
                 returned_quantity, refund_amount, warranty_claims, repair_cost, estimated_cost) = row
                
                sold_revenue = sold_revenue or Decimal('0')
                refund_amount = refund_amount or Decimal('0')
                repair_cost = repair_cost or Decimal('0')
                estimated_cost = estimated_cost or Decimal('0')
                
                gross_profit_product = sold_revenue - estimated_cost
                net_profit_product = gross_profit_product - refund_amount - repair_cost
                return_rate_product = (returned_quantity / sold_quantity * 100) if sold_quantity else 0
                
                product_analysis.append({
                    'product_variant_id': product_variant_id,
                    'sku': sku,
                    'product_name': product_name,
                    'brand_name': brand_name,
                    'sold_quantity': sold_quantity or 0,
                    'sold_revenue': float(sold_revenue),
                    'returned_quantity': returned_quantity or 0,
                    'refund_amount': float(refund_amount),
                    'warranty_claims': warranty_claims or 0,
                    'repair_cost': float(repair_cost),
                    'estimated_cost': float(estimated_cost),
                    'gross_profit': float(gross_profit_product),
                    'net_profit': float(net_profit_product),
                    'return_rate': float(return_rate_product),
                    'profit_margin': float((net_profit_product / sold_revenue * 100) if sold_revenue else 0)
                })
            
            return Response({
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'financial_summary': {
                    'total_revenue': float(total_revenue),
                    'estimated_purchase_cost': float(estimated_purchase_cost),
                    'gross_profit': float(gross_profit),
                    'total_refund_amount': float(total_refund_amount),
                    'total_repair_cost': float(total_repair_cost),
                    'net_profit': float(net_profit),
                    'gross_profit_margin': float((gross_profit / total_revenue * 100) if total_revenue else 0),
                    'net_profit_margin': float((net_profit / total_revenue * 100) if total_revenue else 0)
                },
                'operational_metrics': {
                    'total_orders': total_orders or 0,
                    'total_items_sold': total_items_sold or 0,
                    'total_return_orders': total_return_orders or 0,
                    'total_returned_quantity': total_returned_quantity or 0,
                    'total_warranty_claims': total_warranty_claims or 0,
                    'return_rate': float(return_rate),
                    'warranty_claim_rate': float(warranty_claim_rate)
                },
                'product_analysis': product_analysis
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(f"Error in product_profitability: {e}")
            print(f"Traceback: {traceback.format_exc()}")
            print(f"Debug info - start_date: {start_date}, end_date: {end_date}, store_id: {store_id}, limit: {limit}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def return_product_analysis(self, request):
        """Phân tích return theo sản phẩm chi tiết"""
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            store_id = request.query_params.get('store_id')
            limit = int(request.query_params.get('limit', 10))
            
            if not start_date:
                start_date = (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            if not end_date:
                end_date = timezone.now().strftime('%Y-%m-%d')
            
            store_filter = ""
            if store_id:
                store_filter = f"AND o.store_id = {store_id}"
            else:
                store_filter = self.get_user_store_filter()
            
            with connection.cursor() as cursor:
                cursor.execute(f"""
                    SELECT 
                        pv.id as product_variant_id,
                        pv.sku,
                        p.name as product_name,
                        b.name as brand_name,
                        COUNT(DISTINCT ro.id) as return_orders_count,
                        SUM(rod.quantity) as total_returned_quantity,
                        SUM(ro.refund_amount) as total_refund_amount,
                        COUNT(DISTINCT o.id) as total_orders_count,
                        SUM(od.quantity) as total_sold_quantity,
                        AVG(ro.refund_amount) as average_refund_amount
                    FROM returnorderdetail rod
                    JOIN returnorder ro ON rod.return_order_id = ro.id AND ro.is_deleted = FALSE
                    JOIN orderdetail od ON rod.order_detail_id = od.id
                    JOIN orders o ON od.order_id = o.id
                    JOIN productvariant pv ON od.product_variant_id = pv.id
                    JOIN product p ON pv.product_id = p.id
                    LEFT JOIN brand b ON p.brand_id = b.id
                    WHERE ro.return_date >= %s 
                        AND ro.return_date <= %s 
                        AND rod.is_deleted = FALSE
                        {store_filter}
                    GROUP BY pv.id, pv.sku, p.name, b.name
                    HAVING SUM(rod.quantity) > 0
                    ORDER BY total_returned_quantity DESC
                    LIMIT %s
                """, [start_date, end_date, limit])
                
                results = cursor.fetchall()
            
            product_analysis = []
            for row in results:
                if row and len(row) == 10:  # Kiểm tra đúng số trường
                    (product_variant_id, sku, product_name, brand_name, return_orders_count,
                     total_returned_quantity, total_refund_amount, total_orders_count, 
                     total_sold_quantity, average_refund_amount) = row
                else:
                    # Bỏ qua row không hợp lệ
                    continue
                
                return_rate = (total_returned_quantity / total_sold_quantity * 100) if total_sold_quantity else 0
                
                product_analysis.append({
                    'product_variant_id': product_variant_id,
                    'sku': sku,
                    'product_name': product_name,
                    'brand_name': brand_name,
                    'return_orders_count': return_orders_count or 0,
                    'total_returned_quantity': total_returned_quantity or 0,
                    'total_refund_amount': float(total_refund_amount or 0),
                    'total_orders_count': total_orders_count or 0,
                    'total_sold_quantity': total_sold_quantity or 0,
                    'average_refund_amount': float(average_refund_amount or 0),
                    'return_rate': float(return_rate)
                })
            
            return Response({
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'product_analysis': product_analysis
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def warranty_product_analysis(self, request):
        """Phân tích warranty theo sản phẩm chi tiết"""
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            store_id = request.query_params.get('store_id')
            limit = int(request.query_params.get('limit', 10))
            
            if not start_date:
                start_date = (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            if not end_date:
                end_date = timezone.now().strftime('%Y-%m-%d')
            
            store_filter = ""
            if store_id:
                store_filter = f"AND o.store_id = {store_id}"
            else:
                store_filter = self.get_user_store_filter()
            
            with connection.cursor() as cursor:
                cursor.execute(f"""
                    SELECT 
                        pv.id as product_variant_id,
                        pv.sku,
                        p.name as product_name,
                        b.name as brand_name,
                        COUNT(DISTINCT w.id) as total_warranties,
                        COUNT(DISTINCT wc.id) as warranty_claims,
                        SUM(wc.repair_cost) as total_repair_cost,
                        AVG(wc.repair_cost) as average_repair_cost,
                        COUNT(DISTINCT o.id) as total_orders_count,
                        SUM(od.quantity) as total_sold_quantity
                    FROM warranty w
                    JOIN orderdetail od ON w.order_detail_id = od.id
                    JOIN orders o ON od.order_id = o.id
                    JOIN productvariant pv ON od.product_variant_id = pv.id
                    JOIN product p ON pv.product_id = p.id
                    LEFT JOIN brand b ON p.brand_id = b.id
                    LEFT JOIN warrantyclaim wc ON w.id = wc.warranty_id AND wc.is_deleted = FALSE
                    WHERE w.created_at >= %s 
                        AND w.created_at <= %s 
                        AND w.is_deleted = FALSE
                        {store_filter}
                    GROUP BY pv.id, pv.sku, p.name, b.name
                    HAVING COUNT(DISTINCT w.id) > 0
                    ORDER BY warranty_claims DESC, total_repair_cost DESC
                    LIMIT %s
                """, [start_date, end_date, limit])
                
                results = cursor.fetchall()
            
            product_analysis = []
            for row in results:
                if row and len(row) == 10:  # Kiểm tra đúng số trường
                    (product_variant_id, sku, product_name, brand_name, total_warranties,
                     warranty_claims, total_repair_cost, average_repair_cost, 
                     total_orders_count, total_sold_quantity) = row
                else:
                    # Bỏ qua row không hợp lệ
                    continue
                
                claim_rate = (warranty_claims / total_warranties * 100) if total_warranties else 0
                
                product_analysis.append({
                    'product_variant_id': product_variant_id,
                    'sku': sku,
                    'product_name': product_name,
                    'brand_name': brand_name,
                    'total_warranties': total_warranties or 0,
                    'warranty_claims': warranty_claims or 0,
                    'total_repair_cost': float(total_repair_cost or 0),
                    'average_repair_cost': float(average_repair_cost or 0),
                    'total_orders_count': total_orders_count or 0,
                    'total_sold_quantity': total_sold_quantity or 0,
                    'claim_rate': float(claim_rate)
                })
            
            return Response({
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'product_analysis': product_analysis
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def product_profitability(self, request):
        """Phân tích lợi nhuận theo sản phẩm"""
        try:
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            store_id = request.query_params.get('store_id')
            limit = int(request.query_params.get('limit', 10))
            
            if not start_date:
                start_date = (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d')
            if not end_date:
                end_date = timezone.now().strftime('%Y-%m-%d')
            
            store_filter = ""
            if store_id and store_id.strip():  # Kiểm tra store_id không rỗng
                try:
                    store_id_int = int(store_id)
                    store_filter = f"AND o.store_id = {store_id_int}"
                except (ValueError, TypeError):
                    store_filter = self.get_user_store_filter()
            else:
                store_filter = self.get_user_store_filter()
            
            with connection.cursor() as cursor:
                sql = f"""
                    SELECT 
                        pv.id as product_variant_id,
                        pv.sku,
                        p.name as product_name,
                        COALESCE(b.name, '') as brand_name,
                        SUM(od.quantity) as sold_quantity,
                        SUM(od.final_price) as sold_revenue,
                        COALESCE(SUM(rod.quantity), 0) as returned_quantity,
                        COALESCE(SUM(ro.refund_amount), 0) as refund_amount,
                        COALESCE(COUNT(DISTINCT wc.id), 0) as warranty_claims,
                        COALESCE(SUM(wc.repair_cost), 0) as repair_cost
                    FROM orderdetail od
                    JOIN orders o ON od.order_id = o.id
                    JOIN productvariant pv ON od.product_variant_id = pv.id
                    JOIN product p ON pv.product_id = p.id
                    LEFT JOIN brand b ON p.brand_id = b.id
                    LEFT JOIN returnorderdetail rod ON od.id = rod.order_detail_id AND rod.is_deleted = FALSE
                    LEFT JOIN returnorder ro ON rod.return_order_id = ro.id AND ro.is_deleted = FALSE
                    LEFT JOIN warranty w ON od.id = w.order_detail_id AND w.is_deleted = FALSE
                    LEFT JOIN warrantyclaim wc ON w.id = wc.warranty_id AND wc.is_deleted = FALSE
                    WHERE o.order_date >= %s 
                        AND o.order_date <= %s 
                        AND o.status IN ('delivered', 'completed')
                        AND o.is_deleted = FALSE{f' {store_filter}' if store_filter.strip() else ''}
                    GROUP BY pv.id, pv.sku, p.name, b.name
                    HAVING SUM(od.quantity) > 0
                    ORDER BY sold_revenue DESC
                    LIMIT {limit}
                """
                cursor.execute(sql, [start_date, end_date])
                
                results = cursor.fetchall()
            
            # Kiểm tra kết quả query
            if not results:
                return Response({
                    'period': {
                        'start_date': start_date,
                        'end_date': end_date
                    },
                    'product_analysis': []
                }, status=status.HTTP_200_OK)
            
            product_analysis = []
            for row in results:
                try:
                    # Kiểm tra row có đủ 10 trường không
                    if row and len(row) == 10:
                        # Truy cập từng trường theo index
                        product_variant_id = row[0]
                        sku = row[1] or ''
                        product_name = row[2] or ''
                        brand_name = row[3] or ''
                        sold_quantity = row[4] or 0
                        sold_revenue = row[5] or Decimal('0')
                        returned_quantity = row[6] or 0
                        refund_amount = row[7] or Decimal('0')
                        warranty_claims = row[8] or 0
                        repair_cost = row[9] or Decimal('0')
                        
                        # Tính toán estimated_cost và các chỉ số khác
                        estimated_cost = sold_revenue * Decimal('0.6')
                        gross_profit = sold_revenue - estimated_cost
                        net_profit = gross_profit - refund_amount - repair_cost
                        return_rate = (returned_quantity / sold_quantity * 100) if sold_quantity else 0
                        profit_margin = (net_profit / sold_revenue * 100) if sold_revenue else 0
                        
                        product_analysis.append({
                            'product_variant_id': product_variant_id,
                            'sku': sku,
                            'product_name': product_name,
                            'brand_name': brand_name,
                            'sold_quantity': sold_quantity,
                            'sold_revenue': float(sold_revenue),
                            'returned_quantity': returned_quantity,
                            'refund_amount': float(refund_amount),
                            'warranty_claims': warranty_claims,
                            'repair_cost': float(repair_cost),
                            'estimated_cost': float(estimated_cost),
                            'gross_profit': float(gross_profit),
                            'net_profit': float(net_profit),
                            'return_rate': float(return_rate),
                            'profit_margin': float(profit_margin)
                        })
                    else:
                        print(f"Skipping invalid row: {row}")
                        continue
                except Exception as e:
                    print(f"Error processing row in product_profitability: {e}, row: {row}")
                    continue
            
            return Response({
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                },
                'product_analysis': product_analysis
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 