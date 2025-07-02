from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django_filters import rest_framework as filters
from django.db.models import Sum, Q
from apps.inventory.models.inventory_transaction import InventoryTransaction
from apps.inventory.serializers.inventory_transaction_serializer import (
    InventoryTransactionSerializer, 
    InventoryTransactionCreateSerializer,
    InventoryTransactionSummarySerializer
)
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, AllowAny, OR

class InventoryTransactionFilter(filters.FilterSet):
    # Filter transaction_type không phân biệt chữ hoa chữ thường
    transaction_type = filters.CharFilter(lookup_expr='iexact')
    
    # Filter reference_type không phân biệt chữ hoa chữ thường
    reference_type = filters.CharFilter(lookup_expr='iexact')
    
    # Filter theo tên sản phẩm
    product_name = filters.CharFilter(field_name='inventory__product_variant__product__name', lookup_expr='icontains')
    
    # Filter theo SKU của product variant
    product_sku = filters.CharFilter(field_name='inventory__product_variant__sku', lookup_expr='icontains')
    
    # Filter theo tên cửa hàng
    store_name = filters.CharFilter(field_name='inventory__store__name', lookup_expr='icontains')
    
    # Filter theo reference_id
    reference_id = filters.NumberFilter()
    
    # Filter theo ngày tạo
    created_at_from = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_at_to = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    # Filter theo ngày giao dịch
    transaction_date_from = filters.DateTimeFilter(field_name='transaction_date', lookup_expr='gte')
    transaction_date_to = filters.DateTimeFilter(field_name='transaction_date', lookup_expr='lte')
    
    class Meta:
        model = InventoryTransaction
        fields = [
            'transaction_type', 'reference_type', 'reference_id',
            'inventory__product_variant__product__name', 'inventory__product_variant__sku',
            'inventory__store__name', 'created_at', 'transaction_date'
        ]

class InventoryTransactionViewSet(viewsets.ModelViewSet):
    queryset = InventoryTransaction.objects.all()
    serializer_class = InventoryTransactionSerializer
    filterset_class = InventoryTransactionFilter
    search_fields = ['reference_id', 'note']
    ordering_fields = ['created_at', 'transaction_date']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """
        Sử dụng serializer khác nhau cho từng action
        """
        if self.action in ['create']:
            return InventoryTransactionCreateSerializer
        elif self.action in ['transaction_summary']:
            return InventoryTransactionSummarySerializer
        return InventoryTransactionSerializer

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve', 'transaction_summary']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết giao dịch tồn kho
            return [IsStoreEmployee()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()
    
    def list(self, request, *args, **kwargs):
        """
        Override phương thức list để thêm thống kê tổng nhập/xuất kho
        """
        # Lấy queryset đã được filter
        queryset = self.filter_queryset(self.get_queryset())
        
        # Tính toán thống kê dựa trên queryset đã filter
        total_in = queryset.filter(
            transaction_type__in=['IN', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'GOODS_RECEIPT']
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        total_out = queryset.filter(
            transaction_type__in=['OUT', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'SALE']
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        # Thêm tính toán từ GoodsReceipt (phiếu nhập kho)
        goods_receipt_stats = self._calculate_goods_receipt_stats(request)
        
        # Thêm tính toán từ PurchaseOrder (đơn đặt hàng)
        purchase_order_stats = self._calculate_purchase_order_stats(request)
        
        # Cộng dồn số lượng nhập từ GoodsReceipt vào total_in
        if goods_receipt_stats and 'total_accepted' in goods_receipt_stats:
            total_in += goods_receipt_stats['total_accepted']
        
        # Cộng dồn số lượng xuất từ PurchaseOrder (nếu có xuất kho)
        # Note: PurchaseOrder thường là đặt hàng, không phải xuất kho
        # Nhưng có thể có các trường hợp xuất kho khác
        
        # Thống kê theo loại giao dịch
        transaction_type_stats = queryset.values('transaction_type').annotate(
            total_quantity=Sum('quantity'),
            count=Sum(1)
        ).order_by('transaction_type')
        
        # Thống kê theo reference_type
        reference_type_stats = queryset.values('reference_type').annotate(
            total_quantity=Sum('quantity'),
            count=Sum(1)
        ).order_by('reference_type')
        
        # Thống kê theo cửa hàng
        store_stats = queryset.values(
            'inventory__store__id', 
            'inventory__store__name'
        ).annotate(
            total_in=Sum('quantity', filter=Q(transaction_type__in=['IN', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'GOODS_RECEIPT'])),
            total_out=Sum('quantity', filter=Q(transaction_type__in=['OUT', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'SALE'])),
            count=Sum(1)
        ).order_by('inventory__store__name')
        
        # Thống kê theo sản phẩm
        product_stats = queryset.values(
            'inventory__product_variant__product__id',
            'inventory__product_variant__product__name',
            'inventory__product_variant__sku'
        ).annotate(
            total_in=Sum('quantity', filter=Q(transaction_type__in=['IN', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'GOODS_RECEIPT'])),
            total_out=Sum('quantity', filter=Q(transaction_type__in=['OUT', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'SALE'])),
            count=Sum(1)
        ).order_by('inventory__product_variant__product__name')
        
        # Phân trang
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response_data = self.get_paginated_response(serializer.data)
            # Thêm thống kê vào response
            # Tính toán chi tiết tổng nhập/xuất
            inventory_transactions_in = queryset.filter(
                transaction_type__in=['IN', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'GOODS_RECEIPT']
            ).aggregate(total=Sum('quantity'))['total'] or 0
            
            inventory_transactions_out = queryset.filter(
                transaction_type__in=['OUT', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'SALE']
            ).aggregate(total=Sum('quantity'))['total'] or 0
            
            goods_receipt_in = goods_receipt_stats.get('total_accepted', 0) if goods_receipt_stats else 0
            
            response_data.data['summary'] = {
                'total_in': total_in,
                'total_out': total_out,
                'net_change': total_in - total_out,  # Net change
                'total_transactions': queryset.count(),
                'inventory_breakdown': {
                    'inventory_transactions_in': inventory_transactions_in,
                    'inventory_transactions_out': inventory_transactions_out,
                    'goods_receipt_in': goods_receipt_in
                },
                'transaction_type_stats': list(transaction_type_stats),
                'reference_type_stats': list(reference_type_stats),
                'store_stats': list(store_stats),
                'product_stats': list(product_stats),
                'goods_receipt_stats': goods_receipt_stats,
                'purchase_order_stats': purchase_order_stats
            }
            return response_data
        
        serializer = self.get_serializer(queryset, many=True)
        
        # Tính toán chi tiết tổng nhập/xuất
        inventory_transactions_in = queryset.filter(
            transaction_type__in=['IN', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'GOODS_RECEIPT']
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        inventory_transactions_out = queryset.filter(
            transaction_type__in=['OUT', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'SALE']
        ).aggregate(total=Sum('quantity'))['total'] or 0
        
        goods_receipt_in = goods_receipt_stats.get('total_accepted', 0) if goods_receipt_stats else 0
        
        response_data = {
            'results': serializer.data,
            'summary': {
                'total_in': total_in,
                'total_out': total_out,
                'net_change': total_in - total_out,  # Net change
                'total_transactions': queryset.count(),
                'inventory_breakdown': {
                    'inventory_transactions_in': inventory_transactions_in,
                    'inventory_transactions_out': inventory_transactions_out,
                    'goods_receipt_in': goods_receipt_in
                },
                'transaction_type_stats': list(transaction_type_stats),
                'reference_type_stats': list(reference_type_stats),
                'store_stats': list(store_stats),
                'product_stats': list(product_stats),
                'goods_receipt_stats': goods_receipt_stats,
                'purchase_order_stats': purchase_order_stats
            }
        }
        return Response(response_data)
    
    def _calculate_goods_receipt_stats(self, request):
        """
        Tính toán thống kê từ GoodsReceipt (phiếu nhập kho)
        """
        try:
            from apps.purchases.models.goods_receipt import GoodsReceipt
            from apps.purchases.models.goods_receipt_detail import GoodsReceiptDetail
            from django.db.models import Sum, Q
            
            # Lấy các filter từ request
            store_name = request.query_params.get('store_name', '')
            product_name = request.query_params.get('product_name', '')
            created_at_from = request.query_params.get('created_at_from', '')
            created_at_to = request.query_params.get('created_at_to', '')
            
            # Base queryset
            goods_receipts = GoodsReceipt.objects.filter(is_deleted=False)
            
            # Áp dụng filter theo cửa hàng
            if store_name:
                goods_receipts = goods_receipts.filter(store__name__icontains=store_name)
            
            # Áp dụng filter theo ngày
            if created_at_from:
                goods_receipts = goods_receipts.filter(created_at__gte=created_at_from)
            if created_at_to:
                goods_receipts = goods_receipts.filter(created_at__lte=created_at_to)
            
            # Tính tổng quan
            total_goods_receipts = goods_receipts.count()
            total_amount = goods_receipts.aggregate(total=Sum('total_amount'))['total'] or 0
            
            # Thống kê theo trạng thái
            status_stats = goods_receipts.values('status').annotate(
                count=Sum(1),
                total_amount=Sum('total_amount')
            ).order_by('status')
            
            # Thống kê theo nhà cung cấp
            supplier_stats = goods_receipts.values(
                'supplier__id', 
                'supplier__name'
            ).annotate(
                count=Sum(1),
                total_amount=Sum('total_amount')
            ).order_by('supplier__name')
            
            # Thống kê theo cửa hàng
            store_stats = goods_receipts.values(
                'store__id', 
                'store__name'
            ).annotate(
                count=Sum(1),
                total_amount=Sum('total_amount')
            ).order_by('store__name')
            
            # Thống kê chi tiết sản phẩm
            gr_details = GoodsReceiptDetail.objects.filter(
                goods_receipt__in=goods_receipts,
                is_deleted=False
            )
            
            # Áp dụng filter theo sản phẩm
            if product_name:
                gr_details = gr_details.filter(
                    product_variant__product__name__icontains=product_name
                )
            
            product_stats = gr_details.values(
                'product_variant__product__id',
                'product_variant__product__name',
                'product_variant__sku'
            ).annotate(
                total_ordered=Sum('ordered_quantity'),
                total_received=Sum('received_quantity'),
                total_accepted=Sum('accepted_quantity'),
                total_rejected=Sum('rejected_quantity'),
                total_amount=Sum('subtotal')
            ).order_by('product_variant__product__name')
            
            # Tính tổng số lượng
            total_ordered = gr_details.aggregate(total=Sum('ordered_quantity'))['total'] or 0
            total_received = gr_details.aggregate(total=Sum('received_quantity'))['total'] or 0
            total_accepted = gr_details.aggregate(total=Sum('accepted_quantity'))['total'] or 0
            total_rejected = gr_details.aggregate(total=Sum('rejected_quantity'))['total'] or 0
            
            return {
                'total_goods_receipts': total_goods_receipts,
                'total_amount': total_amount,
                'total_ordered': total_ordered,
                'total_received': total_received,
                'total_accepted': total_accepted,
                'total_rejected': total_rejected,
                'status_stats': list(status_stats),
                'supplier_stats': list(supplier_stats),
                'store_stats': list(store_stats),
                'product_stats': list(product_stats)
            }
            
        except Exception as e:
            return {
                'error': f'Lỗi khi tính toán thống kê GoodsReceipt: {str(e)}',
                'total_goods_receipts': 0,
                'total_amount': 0,
                'total_ordered': 0,
                'total_received': 0,
                'total_accepted': 0,
                'total_rejected': 0,
                'status_stats': [],
                'supplier_stats': [],
                'store_stats': [],
                'product_stats': []
            }
    
    def _calculate_purchase_order_stats(self, request):
        """
        Tính toán thống kê từ PurchaseOrder (đơn đặt hàng)
        """
        try:
            from apps.purchases.models.purchase_order import PurchaseOrder
            from apps.purchases.models.purchase_order_detail import PurchaseOrderDetail
            from django.db.models import Sum, Q
            
            # Lấy các filter từ request
            store_name = request.query_params.get('store_name', '')
            product_name = request.query_params.get('product_name', '')
            created_at_from = request.query_params.get('created_at_from', '')
            created_at_to = request.query_params.get('created_at_to', '')
            
            # Base queryset
            purchase_orders = PurchaseOrder.objects.filter(is_deleted=False)
            
            # Áp dụng filter theo cửa hàng
            if store_name:
                purchase_orders = purchase_orders.filter(store__name__icontains=store_name)
            
            # Áp dụng filter theo ngày
            if created_at_from:
                purchase_orders = purchase_orders.filter(created_at__gte=created_at_from)
            if created_at_to:
                purchase_orders = purchase_orders.filter(created_at__lte=created_at_to)
            
            # Tính tổng quan
            total_purchase_orders = purchase_orders.count()
            total_amount = purchase_orders.aggregate(total=Sum('total_amount'))['total'] or 0
            total_paid = purchase_orders.aggregate(total=Sum('paid_amount'))['total'] or 0
            
            # Thống kê theo trạng thái
            status_stats = purchase_orders.values('status').annotate(
                count=Sum(1),
                total_amount=Sum('total_amount')
            ).order_by('status')
            
            # Thống kê theo trạng thái thanh toán
            payment_status_stats = purchase_orders.values('payment_status').annotate(
                count=Sum(1),
                total_amount=Sum('total_amount'),
                total_paid=Sum('paid_amount')
            ).order_by('payment_status')
            
            # Thống kê theo nhà cung cấp
            supplier_stats = purchase_orders.values(
                'supplier__id', 
                'supplier__name'
            ).annotate(
                count=Sum(1),
                total_amount=Sum('total_amount'),
                total_paid=Sum('paid_amount')
            ).order_by('supplier__name')
            
            # Thống kê theo cửa hàng
            store_stats = purchase_orders.values(
                'store__id', 
                'store__name'
            ).annotate(
                count=Sum(1),
                total_amount=Sum('total_amount'),
                total_paid=Sum('paid_amount')
            ).order_by('store__name')
            
            # Thống kê chi tiết sản phẩm
            po_details = PurchaseOrderDetail.objects.filter(
                purchase_order__in=purchase_orders,
                is_deleted=False
            )
            
            # Áp dụng filter theo sản phẩm
            if product_name:
                po_details = po_details.filter(
                    product_variant__product__name__icontains=product_name
                )
            
            product_stats = po_details.values(
                'product_variant__product__id',
                'product_variant__product__name',
                'product_variant__sku'
            ).annotate(
                total_ordered=Sum('quantity'),
                total_received=Sum('received_quantity'),
                total_amount=Sum('subtotal')
            ).order_by('product_variant__product__name')
            
            # Tính tổng số lượng
            total_ordered = po_details.aggregate(total=Sum('quantity'))['total'] or 0
            total_received = po_details.aggregate(total=Sum('received_quantity'))['total'] or 0
            
            return {
                'total_purchase_orders': total_purchase_orders,
                'total_amount': total_amount,
                'total_paid': total_paid,
                'total_remaining': total_amount - total_paid,
                'total_ordered': total_ordered,
                'total_received': total_received,
                'status_stats': list(status_stats),
                'payment_status_stats': list(payment_status_stats),
                'supplier_stats': list(supplier_stats),
                'store_stats': list(store_stats),
                'product_stats': list(product_stats)
            }
            
        except Exception as e:
            return {
                'error': f'Lỗi khi tính toán thống kê PurchaseOrder: {str(e)}',
                'total_purchase_orders': 0,
                'total_amount': 0,
                'total_paid': 0,
                'total_remaining': 0,
                'total_ordered': 0,
                'total_received': 0,
                'status_stats': [],
                'payment_status_stats': [],
                'supplier_stats': [],
                'store_stats': [],
                'product_stats': []
            }
    
    @action(detail=True, methods=['get'], url_path='transaction_summary')
    def transaction_summary(self, request, pk=None):
        """
        Lấy thống kê tổng quan về giao dịch inventory
        """
        try:
            # Lấy inventory transaction theo ID
            transaction = self.get_object()
            inventory = transaction.inventory
            
            if not inventory:
                return Response(
                    {'error': 'Không tìm thấy inventory cho giao dịch này'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Lấy tất cả giao dịch của inventory này
            all_transactions = InventoryTransaction.objects.filter(
                inventory=inventory,
                is_deleted=False
            ).order_by('-transaction_date')
            
            # Tính tổng nhập và xuất
            total_in = all_transactions.filter(
                transaction_type__in=['IN', 'TRANSFER_IN', 'ADJUSTMENT_IN', 'GOODS_RECEIPT']
            ).aggregate(total=Sum('quantity'))['total'] or 0
            
            total_out = all_transactions.filter(
                transaction_type__in=['OUT', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'SALE']
            ).aggregate(total=Sum('quantity'))['total'] or 0
            
            # Tồn kho hiện tại
            current_stock = inventory.quantity
            
            # Giao dịch cuối cùng
            last_transaction = all_transactions.first()
            last_transaction_data = None
            if last_transaction:
                last_transaction_data = {
                    'id': last_transaction.id,
                    'transaction_type': last_transaction.transaction_type,
                    'quantity': last_transaction.quantity,
                    'transaction_date': last_transaction.transaction_date,
                    'note': last_transaction.note
                }
            
            # Lịch sử giao dịch (10 giao dịch gần nhất)
            history = []
            for trans in all_transactions[:10]:
                history.append({
                    'id': trans.id,
                    'transaction_type': trans.transaction_type,
                    'quantity': trans.quantity,
                    'transaction_date': trans.transaction_date,
                    'note': trans.note,
                    'reference_type': trans.reference_type,
                    'reference_id': trans.reference_id
                })
            
            # Thông tin sản phẩm và cửa hàng
            product_variant = inventory.product_variant
            store = inventory.store
            
            response_data = {
                'id': transaction.id,
                'inventory': inventory.id,
                'product_variant': {
                    'id': product_variant.id if product_variant else None,
                    'name': product_variant.product.name if product_variant and product_variant.product else None,
                    'sku': product_variant.sku if product_variant else None
                },
                'store': {
                    'id': store.id if store else None,
                    'name': store.name if store else None
                },
                'total_in': total_in,
                'total_out': total_out,
                'current_stock': current_stock,
                'last_transaction': last_transaction_data,
                'history': history
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except InventoryTransaction.DoesNotExist:
            return Response(
                {'error': 'Không tìm thấy giao dịch inventory'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Lỗi khi lấy thống kê: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 