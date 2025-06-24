from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django.db import transaction
from django.utils import timezone
from rest_framework.permissions import OR

from apps.purchases.models.goods_receipt import GoodsReceipt
from apps.purchases.models.goods_receipt_detail import GoodsReceiptDetail
from apps.purchases.serializers.goods_receipt_serializer import (
    GoodsReceiptSerializer, 
    GoodsReceiptListSerializer
)
from apps.purchases.serializers.goods_receipt_detail_serializer import (
    GoodsReceiptDetailCreateSerializer
)
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from apps.core.mixins import SoftDeleteMixin
from apps.stores.models.employee import Employee
from apps.inventory.models.inventory import Inventory
from apps.inventory.models.inventory_transaction import InventoryTransaction


class GoodsReceiptFilter(filters.FilterSet):
    """Bộ lọc cho GoodsReceipt"""
    # Bộ lọc theo nhà cung cấp
    supplier_name = filters.CharFilter(field_name='supplier__name', lookup_expr='icontains')
    supplier_email = filters.CharFilter(field_name='supplier__email', lookup_expr='icontains')
    
    # Bộ lọc theo cửa hàng
    store_name = filters.CharFilter(field_name='store__name', lookup_expr='icontains')
    
    # Bộ lọc theo nhân viên
    employee_name = filters.CharFilter(field_name='employee__name', lookup_expr='icontains')
    employee_email = filters.CharFilter(field_name='employee__email', lookup_expr='icontains')
    
    # Bộ lọc theo mã phiếu nhập
    receipt_number = filters.CharFilter(lookup_expr='icontains')
    
    # Bộ lọc theo đơn đặt hàng
    purchase_order = filters.NumberFilter(field_name='purchase_order', lookup_expr='exact')
    po_number = filters.CharFilter(field_name='purchase_order__po_number', lookup_expr='icontains')
    
    # Bộ lọc theo trạng thái
    status = filters.CharFilter(lookup_expr='iexact')
    
    # Bộ lọc theo ngày
    receipt_date_from = filters.DateTimeFilter(field_name='receipt_date', lookup_expr='gte')
    receipt_date_to = filters.DateTimeFilter(field_name='receipt_date', lookup_expr='lte')
    created_at_from = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_at_to = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    # Bộ lọc theo số tiền
    total_amount_min = filters.NumberFilter(field_name='total_amount', lookup_expr='gte')
    total_amount_max = filters.NumberFilter(field_name='total_amount', lookup_expr='lte')
    
    # Bộ lọc theo kiểm tra chất lượng
    is_quality_checked = filters.BooleanFilter()
    
    class Meta:
        model = GoodsReceipt
        fields = [
            'supplier', 'store', 'employee', 'receipt_number', 'purchase_order',
            'status', 'receipt_date', 'created_at', 'total_amount'
        ]


class GoodsReceiptViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    """
    ViewSet cho GoodsReceipt
    """
    queryset = GoodsReceipt.objects.filter(is_deleted=False)
    serializer_class = GoodsReceiptSerializer
    filterset_class = GoodsReceiptFilter
    search_fields = [
        'receipt_number', 'supplier__name', 'supplier__email', 'store__name',
        'employee__name', 'employee__email', 'delivery_note', 'notes'
    ]
    ordering_fields = [
        'receipt_number', 'receipt_date', 'total_amount', 'created_at'
    ]
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép user đã đăng nhập có quyền xem danh sách và chi tiết phiếu nhập kho
            return [IsStoreEmployee()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    def get_queryset(self):
        """Lọc phiếu nhập kho dựa trên quyền và cửa hàng của người dùng"""
        queryset = super().get_queryset()
        user = self.request.user

        # Nếu là superuser, trả về tất cả phiếu nhập kho
        if user.is_superuser:
            return queryset

        # Lấy employee của user
        try:
            employee = Employee.objects.get(user=user, is_deleted=False)
            user_store = employee.store
            # Chỉ trả về phiếu nhập kho của cửa hàng người dùng thuộc về
            return queryset.filter(store=user_store)
        except Employee.DoesNotExist:
            return GoodsReceipt.objects.none()

    def get_serializer_class(self):
        """Chọn serializer phù hợp"""
        if self.action == 'list':
            return GoodsReceiptListSerializer
        return GoodsReceiptSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Tạo phiếu nhập kho mới với chi tiết"""
        try:
            # Lấy dữ liệu từ request
            details_data = request.data.pop('details', [])
            purchase_order_id = request.data.get('purchase_order')
            
            # Tạo phiếu nhập kho
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            goods_receipt = serializer.save(
                created_by=request.user,
                updated_by=request.user
            )
            
            # Nếu có purchase_order, tự động tạo chi tiết từ purchase_order_detail
            if purchase_order_id and not details_data:
                from apps.purchases.models.purchase_order import PurchaseOrder
                try:
                    purchase_order = PurchaseOrder.objects.get(id=purchase_order_id)
                    # Tạo chi tiết phiếu nhập từ tất cả chi tiết đơn đặt hàng
                    for po_detail in purchase_order.details.filter(is_deleted=False):
                        # Kiểm tra xem sản phẩm đã tồn tại trong phiếu nhập kho chưa
                        existing_detail = goods_receipt.details.filter(
                            product_variant=po_detail.product_variant,
                            is_deleted=False
                        ).first()
                        
                        if existing_detail:
                            # Nếu sản phẩm đã tồn tại, bỏ qua hoặc cập nhật
                            continue
                        
                        # Tạo chi tiết phiếu nhập với thông tin từ đơn đặt hàng
                        detail_data = {
                            'goods_receipt': goods_receipt.id,
                            'purchase_order_detail': po_detail.id,
                            'product_variant': po_detail.product_variant.id,
                            'ordered_quantity': po_detail.quantity,  # Lấy từ purchase_order_detail
                            'received_quantity': 0,  # Mặc định 0
                            'accepted_quantity': 0,  # Mặc định 0
                            'rejected_quantity': 0,  # Mặc định 0
                            'unit_price': po_detail.unit_price,  # Lấy từ purchase_order_detail
                            'discount_percent': po_detail.discount_percent,  # Lấy từ purchase_order_detail
                            'tax_percent': po_detail.tax_percent,  # Lấy từ purchase_order_detail
                            'quality_status': 'pending',  # Mặc định pending
                            'quality_notes': '',
                            'notes': f"Tự động tạo từ đơn đặt hàng {purchase_order.po_number}"
                        }
                        
                        detail_serializer = GoodsReceiptDetailCreateSerializer(data=detail_data)
                        detail_serializer.is_valid(raise_exception=True)
                        detail_serializer.save()
                    
                    # Cập nhật thông tin phiếu nhập từ đơn đặt hàng
                    goods_receipt.supplier = purchase_order.supplier
                    goods_receipt.store = purchase_order.store
                    if not goods_receipt.expected_receipt_date:
                        goods_receipt.expected_receipt_date = purchase_order.expected_delivery_date
                    goods_receipt.save()
                    
                except PurchaseOrder.DoesNotExist:
                    return Response(
                        {"detail": "Đơn đặt hàng không tồn tại"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                # Tạo chi tiết phiếu nhập kho từ dữ liệu được gửi
                for detail_data in details_data:
                    detail_data['goods_receipt'] = goods_receipt.id
                    detail_serializer = GoodsReceiptDetailCreateSerializer(data=detail_data)
                    detail_serializer.is_valid(raise_exception=True)
                    detail_serializer.save()
            
            # Cập nhật tổng tiền cho phiếu nhập kho
            # Khi tạo phiếu nhập kho mới, total_amount = 0 vì chưa nhập hàng thực tế
            goods_receipt.subtotal = 0
            goods_receipt.tax_amount = 0
            goods_receipt.discount_amount = 0
            goods_receipt.total_amount = 0
            goods_receipt.save()
            
            # Trả về response với đầy đủ thông tin
            response_serializer = GoodsReceiptSerializer(goods_receipt)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            transaction.set_rollback(True)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """Cập nhật phiếu nhập kho"""
        try:
            instance = self.get_object()
            old_status = instance.status
            new_status = request.data.get('status', old_status)
            
            # Cập nhật phiếu nhập kho
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            goods_receipt = serializer.save(updated_by=request.user)

            # --- TỰ ĐỘNG CỘNG/TRỪ TỒN KHO THEO TRẠNG THÁI ---
            # Cộng tồn kho khi chuyển sang confirmed
            if old_status != 'confirmed' and new_status == 'confirmed':
                for detail in goods_receipt.details.filter(is_deleted=False):
                    # Tìm hoặc tạo inventory record
                    inventory, created = Inventory.objects.get_or_create(
                        store=goods_receipt.store,
                        product_variant=detail.product_variant,
                        defaults={
                            'quantity': 0,
                            'created_by': request.user,
                            'updated_by': request.user
                        }
                    )
                    inventory.quantity += detail.accepted_quantity
                    inventory.updated_by = request.user
                    inventory.save()
                    # Tạo inventory transaction
                    InventoryTransaction.objects.create(
                        inventory=inventory,
                        transaction_type='in',
                        quantity=detail.accepted_quantity,
                        unit_price=detail.unit_price,
                        reference_type='goods_receipt',
                        reference_id=goods_receipt.id,
                        note=f"Nhập kho từ phiếu nhập {goods_receipt.receipt_number} - Nhân viên: {goods_receipt.employee.name if goods_receipt.employee else 'N/A'}",
                        created_by=request.user,
                        updated_by=request.user
                    )
            # Trừ tồn kho khi chuyển từ confirmed về trạng thái khác
            elif old_status == 'confirmed' and new_status != 'confirmed':
                for detail in goods_receipt.details.filter(is_deleted=False):
                    inventory = Inventory.objects.filter(
                        store=goods_receipt.store,
                        product_variant=detail.product_variant
                    ).first()
                    if inventory:
                        inventory.quantity -= detail.accepted_quantity
                        inventory.updated_by = request.user
                        inventory.save()
                        # Tạo inventory transaction
                        InventoryTransaction.objects.create(
                            inventory=inventory,
                            transaction_type='out',
                            quantity=detail.accepted_quantity,
                            unit_price=detail.unit_price,
                            reference_type='goods_receipt',
                            reference_id=goods_receipt.id,
                            note=f"Hủy nhập kho từ phiếu nhập {goods_receipt.receipt_number} - Nhân viên: {goods_receipt.employee.name if goods_receipt.employee else 'N/A'}",
                            created_by=request.user,
                            updated_by=request.user
                        )
            # --- END ---

            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            transaction.set_rollback(True)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def confirm_receipt(self, request, pk=None):
        """Xác nhận phiếu nhập kho và tự động cập nhật tồn kho"""
        try:
            goods_receipt = self.get_object()
            
            if goods_receipt.status not in ['draft', 'pending']:
                return Response(
                    {"detail": "Chỉ có thể xác nhận phiếu nhập kho ở trạng thái nháp hoặc chờ xác nhận"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Cập nhật trạng thái
            old_status = goods_receipt.status
            goods_receipt.status = 'confirmed'
            goods_receipt.updated_by = request.user
            goods_receipt.save()
            
            # TỰ ĐỘNG CỘNG TỒN KHO KHI XÁC NHẬN
            updated_items = []
            for detail in goods_receipt.details.filter(is_deleted=False):
                if detail.can_update_inventory:  # accepted_quantity > 0
                    # Tìm hoặc tạo inventory record
                    inventory, created = Inventory.objects.get_or_create(
                        store=goods_receipt.store,
                        product_variant=detail.product_variant,
                        defaults={
                            'quantity': 0,
                            'created_by': request.user,
                            'updated_by': request.user
                        }
                    )
                    
                    # Cập nhật số lượng
                    old_quantity = inventory.quantity
                    inventory.quantity += detail.accepted_quantity
                    inventory.updated_by = request.user
                    inventory.save()
                    
                    # Tạo inventory transaction
                    InventoryTransaction.objects.create(
                        inventory=inventory,
                        transaction_type='in',
                        quantity=detail.accepted_quantity,
                        unit_price=detail.unit_price,
                        reference_type='goods_receipt',
                        reference_id=goods_receipt.id,
                        note=f"Nhập kho từ phiếu nhập {goods_receipt.receipt_number} - Nhân viên: {goods_receipt.employee.name if goods_receipt.employee else 'N/A'}",
                        created_by=request.user,
                        updated_by=request.user
                    )
                    
                    # Cập nhật số lượng đã nhận trong purchase order detail
                    if detail.purchase_order_detail:
                        detail.purchase_order_detail.received_quantity += detail.accepted_quantity
                        detail.purchase_order_detail.save()
                        
                        # Cập nhật trạng thái đơn đặt hàng nếu cần
                        purchase_order = detail.purchase_order_detail.purchase_order
                        self._update_purchase_order_status(purchase_order)
                    
                    updated_items.append({
                        'product_name': detail.product_variant.product.name,
                        'quantity_added': detail.accepted_quantity,
                        'old_stock': old_quantity,
                        'new_stock': inventory.quantity
                    })
            
            serializer = self.get_serializer(goods_receipt)
            return Response({
                "message": f"Đã xác nhận phiếu nhập {goods_receipt.receipt_number} và cập nhật tồn kho thành công",
                "goods_receipt": serializer.data,
                "updated_items": updated_items,
                "total_items_updated": len(updated_items)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def update_inventory(self, request, pk=None):
        """Hoàn thành phiếu nhập kho (chuyển sang trạng thái completed)"""
        try:
            goods_receipt = self.get_object()
            
            if goods_receipt.status != 'confirmed':
                return Response(
                    {"detail": "Chỉ có thể hoàn thành phiếu nhập kho khi đã được xác nhận"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Chuyển sang trạng thái completed
            goods_receipt.status = 'completed'
            goods_receipt.actual_delivery_date = timezone.now()
            goods_receipt.updated_by = request.user
            goods_receipt.save()
            
            return Response({
                "message": f"Đã hoàn thành phiếu nhập {goods_receipt.receipt_number}",
                "note": "Tồn kho đã được cập nhật tự động khi xác nhận phiếu nhập kho",
                "goods_receipt": self.get_serializer(goods_receipt).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def _update_purchase_order_status(self, purchase_order):
        """Cập nhật trạng thái đơn đặt hàng dựa trên số lượng đã nhận"""
        total_ordered = 0
        total_received = 0
        
        for detail in purchase_order.details.filter(is_deleted=False):
            total_ordered += detail.quantity
            total_received += detail.received_quantity
        
        # Cập nhật trạng thái
        if total_received == 0:
            purchase_order.status = 'ordered'
        elif total_received >= total_ordered:
            purchase_order.status = 'completed'
        else:
            purchase_order.status = 'partially_received'
        
        purchase_order.save()

    @action(detail=True, methods=['post'])
    def update_received_quantities(self, request, pk=None):
        """Cập nhật số lượng nhập từ đơn đặt hàng"""
        try:
            goods_receipt = self.get_object()
            
            if not goods_receipt.purchase_order:
                return Response(
                    {"detail": "Phiếu nhập này không liên kết với đơn đặt hàng"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            received_data = request.data.get('received_quantities', [])
            if not received_data:
                return Response(
                    {"detail": "received_quantities là bắt buộc"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            updated_details = []
            
            for item in received_data:
                detail_id = item.get('detail_id')
                received_qty = item.get('received_quantity', 0)
                accepted_qty = item.get('accepted_quantity', 0)
                rejected_qty = item.get('rejected_quantity', 0)
                quality_notes = item.get('quality_notes', '')
                
                try:
                    detail = goods_receipt.details.get(id=detail_id)
                    
                    # Validate số lượng
                    if received_qty < 0 or accepted_qty < 0 or rejected_qty < 0:
                        return Response(
                            {"detail": f"Số lượng không được âm cho chi tiết {detail_id}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    if accepted_qty + rejected_qty != received_qty:
                        return Response(
                            {"detail": f"Tổng số lượng chấp nhận và từ chối phải bằng số lượng nhận cho chi tiết {detail_id}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Cập nhật chi tiết
                    detail.received_quantity = received_qty
                    detail.accepted_quantity = accepted_qty
                    detail.rejected_quantity = rejected_qty
                    detail.quality_notes = quality_notes
                    detail.save()
                    
                    updated_details.append({
                        'detail_id': detail_id,
                        'product_name': detail.product_variant.product.name,
                        'received_quantity': received_qty,
                        'accepted_quantity': accepted_qty,
                        'rejected_quantity': rejected_qty
                    })
                    
                except GoodsReceiptDetail.DoesNotExist:
                    return Response(
                        {"detail": f"Chi tiết phiếu nhập {detail_id} không tồn tại"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Cập nhật tổng tiền cho phiếu nhập kho dựa trên số lượng thực tế đã chấp nhận
            total_subtotal = 0
            total_tax = 0
            total_discount = 0
            
            for detail in goods_receipt.details.filter(is_deleted=False):
                total_subtotal += detail.subtotal
                total_tax += detail.tax_amount
                total_discount += detail.discount_amount
            
            goods_receipt.subtotal = total_subtotal
            goods_receipt.tax_amount = total_tax
            goods_receipt.discount_amount = total_discount
            goods_receipt.total_amount = total_subtotal + total_tax - total_discount
            
            goods_receipt.save()
            
            return Response({
                "message": "Đã cập nhật số lượng nhập thành công",
                "updated_details": updated_details,
                "total_subtotal": total_subtotal,
                "total_tax": total_tax,
                "total_discount": total_discount
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def get_receipt_details(self, request, pk=None):
        """Lấy danh sách chi tiết phiếu nhập với thông tin đơn đặt hàng"""
        try:
            goods_receipt = self.get_object()
            
            details = []
            for detail in goods_receipt.details.filter(is_deleted=False):
                detail_info = {
                    'id': detail.id,
                    'product_variant': {
                        'id': detail.product_variant.id,
                        'name': detail.product_variant.product.name,
                        'sku': detail.product_variant.sku,
                        'product_name': detail.product_variant.product.name
                    },
                    'ordered_quantity': detail.ordered_quantity,
                    'received_quantity': detail.received_quantity,
                    'accepted_quantity': detail.accepted_quantity,
                    'rejected_quantity': detail.rejected_quantity,
                    'missing_quantity': detail.missing_quantity,
                    'unit_price': detail.unit_price,
                    'discount_percent': detail.discount_percent,
                    'tax_percent': detail.tax_percent,
                    'subtotal': detail.subtotal,
                    'quality_status': detail.quality_status,
                    'quality_notes': detail.quality_notes,
                    'notes': detail.notes,
                    'can_update_inventory': detail.can_update_inventory
                }
                
                # Thông tin đơn đặt hàng nếu có
                if detail.purchase_order_detail:
                    po_detail = detail.purchase_order_detail
                    detail_info['purchase_order_detail'] = {
                        'id': po_detail.id,
                        'purchase_order': {
                            'id': po_detail.purchase_order.id,
                            'po_number': po_detail.purchase_order.po_number,
                            'order_date': po_detail.purchase_order.order_date
                        },
                        'ordered_quantity': po_detail.quantity,
                        'received_quantity': po_detail.received_quantity,
                        'remaining_quantity': po_detail.quantity - po_detail.received_quantity
                    }
                else:
                    detail_info['purchase_order_detail'] = None
                
                details.append(detail_info)
            
            return Response({
                'receipt_id': goods_receipt.id,
                'receipt_number': goods_receipt.receipt_number,
                'details': details,
                'total_details': len(details)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def get_receipt_summary(self, request, pk=None):
        """Lấy thông tin tổng quan về phiếu nhập"""
        try:
            goods_receipt = self.get_object()
            
            # Thống kê chi tiết
            details = goods_receipt.details.filter(is_deleted=False)
            total_items = details.count()
            total_ordered = sum(detail.ordered_quantity for detail in details)
            total_received = sum(detail.received_quantity for detail in details)
            total_accepted = sum(detail.accepted_quantity for detail in details)
            total_rejected = sum(detail.rejected_quantity for detail in details)
            total_missing = sum(detail.missing_quantity for detail in details)
            
            # Thống kê theo trạng thái chất lượng
            pending_items = sum(1 for detail in details if detail.quality_status == 'pending')
            accepted_items = sum(1 for detail in details if detail.quality_status == 'accepted')
            rejected_items = sum(1 for detail in details if detail.quality_status == 'rejected')
            partial_items = sum(1 for detail in details if detail.quality_status == 'partial')
            
            # Thống kê tài chính
            total_subtotal = sum(detail.subtotal for detail in details)
            total_tax = sum(detail.tax_amount for detail in details)
            total_discount = sum(detail.discount_amount for detail in details)
            
            # Thông tin đơn đặt hàng nếu có
            po_info = None
            if goods_receipt.purchase_order:
                po = goods_receipt.purchase_order
                po_info = {
                    'id': po.id,
                    'po_number': po.po_number,
                    'order_date': po.order_date,
                    'expected_delivery_date': po.expected_delivery_date,
                    'status': po.status,
                    'total_amount': po.total_amount,
                    'supplier': {
                        'id': po.supplier.id,
                        'name': po.supplier.name,
                        'email': po.supplier.email,
                        'phone': po.supplier.phone,
                        'address': po.supplier.address
                    },
                    'store': {
                        'id': po.store.id,
                        'name': po.store.name,
                        'address': po.store.address,
                        'phone': po.store.phone
                    },
                    'employee': {
                        'id': po.employee.id,
                        'name': po.employee.name,
                        'email': po.employee.email,
                        'phone': po.employee.phone
                    } if po.employee else None
                }
            
            summary = {
                'receipt_info': {
                    'id': goods_receipt.id,
                    'receipt_number': goods_receipt.receipt_number,
                    'status': goods_receipt.status,
                    'receipt_date': goods_receipt.receipt_date,
                    'supplier_name': goods_receipt.supplier.name,
                    'store_name': goods_receipt.store.name,
                    'employee_name': goods_receipt.employee.name if goods_receipt.employee else None
                },
                'purchase_order_info': po_info,
                'quantity_summary': {
                    'total_items': total_items,
                    'total_ordered': total_ordered,
                    'total_received': total_received,
                    'total_accepted': total_accepted,
                    'total_rejected': total_rejected,
                    'total_missing': total_missing,
                    'receipt_progress': (total_received / total_ordered * 100) if total_ordered > 0 else 0,
                    'acceptance_rate': (total_accepted / total_received * 100) if total_received > 0 else 0
                },
                'quality_summary': {
                    'pending_items': pending_items,
                    'accepted_items': accepted_items,
                    'rejected_items': rejected_items,
                    'partial_items': partial_items,
                    'quality_checked_items': accepted_items + rejected_items + partial_items
                },
                'financial_summary': {
                    'subtotal': total_subtotal,
                    'tax_amount': total_tax,
                    'discount_amount': total_discount,
                    'total_amount': total_subtotal + total_tax - total_discount
                }
            }
            
            return Response(summary, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def quantity_variance(self, request, pk=None):
        """Tính toán chênh lệch số lượng giữa đơn đặt hàng và nhập kho"""
        try:
            goods_receipt = self.get_object()
            variance_data = goods_receipt.get_quantity_variance_summary()
            
            if variance_data is None:
                return Response(
                    {"detail": "Phiếu nhập kho này không liên kết với đơn đặt hàng"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(variance_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def financial_variance(self, request, pk=None):
        """Tính toán chênh lệch tài chính giữa đơn đặt hàng và nhập kho"""
        try:
            goods_receipt = self.get_object()
            variance_data = goods_receipt.get_financial_variance_summary()
            
            if variance_data is None:
                return Response(
                    {"detail": "Phiếu nhập kho này không liên kết với đơn đặt hàng"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response(variance_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def quality_issues(self, request, pk=None):
        """Tóm tắt các vấn đề chất lượng"""
        try:
            goods_receipt = self.get_object()
            quality_data = goods_receipt.get_quality_issues_summary()
            
            return Response(quality_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def get_available_purchase_orders(self, request):
        """Lấy danh sách đơn đặt hàng có thể tạo phiếu nhập"""
        try:
            from apps.purchases.models.purchase_order import PurchaseOrder
            
            # Lọc đơn đặt hàng theo quyền người dùng
            user = request.user
            if user.is_superuser:
                purchase_orders = PurchaseOrder.objects.filter(is_deleted=False)
            else:
                try:
                    from apps.stores.models.employee import Employee
                    employee = Employee.objects.get(user=user, is_deleted=False)
                    user_store = employee.store
                    purchase_orders = PurchaseOrder.objects.filter(
                        store=user_store,
                        is_deleted=False
                    )
                except Employee.DoesNotExist:
                    return Response(
                        {"detail": "Không tìm thấy thông tin nhân viên"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Lọc đơn đặt hàng có thể tạo phiếu nhập
            available_orders = []
            for po in purchase_orders:
                # Kiểm tra trạng thái đơn đặt hàng
                if po.status not in ['ordered', 'confirmed', 'partially_received']:
                    continue
                
                # Kiểm tra xem đã có phiếu nhập chưa
                existing_receipt = GoodsReceipt.objects.filter(
                    purchase_order=po,
                    is_deleted=False
                ).first()
                
                if existing_receipt:
                    continue
                
                # Kiểm tra xem có chi tiết nào còn có thể nhập không
                has_receivable_items = False
                total_ordered = 0
                total_received = 0
                
                for po_detail in po.details.filter(is_deleted=False):
                    total_ordered += po_detail.quantity
                    total_received += po_detail.received_quantity
                    if po_detail.quantity > po_detail.received_quantity:
                        has_receivable_items = True
                
                if has_receivable_items:
                    available_orders.append({
                        'id': po.id,
                        'po_number': po.po_number,
                        'supplier_name': po.supplier.name,
                        'store_name': po.store.name,
                        'order_date': po.order_date,
                        'expected_delivery_date': po.expected_delivery_date,
                        'status': po.status,
                        'total_amount': po.total_amount,
                        'total_ordered': total_ordered,
                        'total_received': total_received,
                        'remaining_quantity': total_ordered - total_received,
                        'receipt_progress': (total_received / total_ordered * 100) if total_ordered > 0 else 0
                    })
            
            # Sắp xếp theo ngày đặt hàng mới nhất
            available_orders.sort(key=lambda x: x['order_date'], reverse=True)
            
            return Response({
                'available_orders': available_orders,
                'total_count': len(available_orders)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def get_purchase_order_info(self, request):
        """Lấy thông tin đơn đặt hàng để tạo phiếu nhập"""
        try:
            purchase_order_id = request.query_params.get('purchase_order')
            if not purchase_order_id:
                return Response(
                    {"detail": "purchase_order là bắt buộc"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            from apps.purchases.models.purchase_order import PurchaseOrder
            try:
                purchase_order = PurchaseOrder.objects.get(id=purchase_order_id, is_deleted=False)
            except PurchaseOrder.DoesNotExist:
                return Response(
                    {"detail": "Đơn đặt hàng không tồn tại"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Kiểm tra xem đã có phiếu nhập cho đơn đặt hàng này chưa
            existing_receipt = GoodsReceipt.objects.filter(
                purchase_order=purchase_order,
                is_deleted=False
            ).first()
            
            if existing_receipt:
                return Response(
                    {"detail": f"Đã tồn tại phiếu nhập {existing_receipt.receipt_number} cho đơn đặt hàng này"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Lấy thông tin chi tiết đơn đặt hàng
            po_details = []
            for po_detail in purchase_order.details.filter(is_deleted=False):
                # Tính số lượng còn lại có thể nhập
                remaining_quantity = po_detail.quantity - po_detail.received_quantity
                
                po_details.append({
                    'id': po_detail.id,
                    'product_variant': {
                        'id': po_detail.product_variant.id,
                        'name': po_detail.product_variant.product.name,
                        'sku': po_detail.product_variant.sku,
                        'product_name': po_detail.product_variant.product.name
                    },
                    'ordered_quantity': po_detail.quantity,
                    'received_quantity': po_detail.received_quantity,
                    'remaining_quantity': remaining_quantity,
                    'unit_price': po_detail.unit_price,
                    'discount_percent': po_detail.discount_percent,
                    'tax_percent': po_detail.tax_percent,
                    'subtotal': po_detail.subtotal,
                    'can_receive': remaining_quantity > 0
                })
            
            # Thông tin đơn đặt hàng
            po_info = {
                'id': purchase_order.id,
                'po_number': purchase_order.po_number,
                'supplier': {
                    'id': purchase_order.supplier.id,
                    'name': purchase_order.supplier.name,
                    'email': purchase_order.supplier.email,
                    'phone': purchase_order.supplier.phone,
                    'address': purchase_order.supplier.address,
                    'tax_code': purchase_order.supplier.tax_code,
                    'website': purchase_order.supplier.website,
                    'contact_person': purchase_order.supplier.contact_person,
                    'is_active': purchase_order.supplier.is_active
                },
                'store': {
                    'id': purchase_order.store.id,
                    'name': purchase_order.store.name,
                    'address': purchase_order.store.address,
                    'phone': purchase_order.store.phone,
                    'store_code': purchase_order.store.store_code,
                    'is_active': purchase_order.store.is_active
                },
                'employee': {
                    'id': purchase_order.employee.id,
                    'name': purchase_order.employee.name,
                    'employee_code': purchase_order.employee.employee_code,
                    'position': purchase_order.employee.position,
                    'phone': purchase_order.employee.phone,
                    'email': purchase_order.employee.email,
                    'address': purchase_order.employee.address,
                    'hire_date': purchase_order.employee.hire_date,
                    'is_manager': purchase_order.employee.is_manager,
                    'store': {
                        'id': purchase_order.employee.store.id,
                        'name': purchase_order.employee.store.name
                    } if purchase_order.employee.store else None
                } if purchase_order.employee else None,
                'order_date': purchase_order.order_date,
                'expected_delivery_date': purchase_order.expected_delivery_date,
                'actual_delivery_date': purchase_order.actual_delivery_date,
                'status': purchase_order.status,
                'payment_status': purchase_order.payment_status,
                'payment_terms': purchase_order.payment_terms,
                'shipping_address': purchase_order.shipping_address,
                'shipping_method': purchase_order.shipping_method,
                'subtotal': purchase_order.subtotal,
                'tax_amount': purchase_order.tax_amount,
                'discount_amount': purchase_order.discount_amount,
                'total_amount': purchase_order.total_amount,
                'paid_amount': purchase_order.paid_amount,
                'notes': purchase_order.notes,
                'details': po_details,
                'total_items': len(po_details),
                'receivable_items': sum(1 for detail in po_details if detail['can_receive']),
                'created_at': purchase_order.created_at,
                'updated_at': purchase_order.updated_at
            }
            
            return Response(po_info, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def create_from_purchase_order(self, request):
        """Tạo phiếu nhập kho từ đơn đặt hàng"""
        try:
            purchase_order_id = request.data.get('purchase_order')
            if not purchase_order_id:
                return Response(
                    {"detail": "purchase_order là bắt buộc"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            from apps.purchases.models.purchase_order import PurchaseOrder
            try:
                purchase_order = PurchaseOrder.objects.get(id=purchase_order_id, is_deleted=False)
            except PurchaseOrder.DoesNotExist:
                return Response(
                    {"detail": "Đơn đặt hàng không tồn tại"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Kiểm tra xem đã có phiếu nhập cho đơn đặt hàng này chưa
            existing_receipt = GoodsReceipt.objects.filter(
                purchase_order=purchase_order,
                is_deleted=False
            ).first()
            
            if existing_receipt:
                return Response(
                    {"detail": f"Đã tồn tại phiếu nhập {existing_receipt.receipt_number} cho đơn đặt hàng này"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Tạo phiếu nhập kho mới
            receipt_data = {
                'purchase_order': purchase_order.id,
                'supplier': purchase_order.supplier.id,
                'store': purchase_order.store.id,
                'employee': request.data.get('employee'),
                'receipt_date': request.data.get('receipt_date'),
                'expected_receipt_date': purchase_order.expected_delivery_date,
                'delivery_note': request.data.get('delivery_note', ''),
                'vehicle_number': request.data.get('vehicle_number', ''),
                'driver_name': request.data.get('driver_name', ''),
                'status': 'draft',
                'notes': f"Tự động tạo từ đơn đặt hàng {purchase_order.po_number}"
            }
            
            # Tạo phiếu nhập kho
            serializer = self.get_serializer(data=receipt_data)
            serializer.is_valid(raise_exception=True)
            goods_receipt = serializer.save(
                created_by=request.user,
                updated_by=request.user
            )
            
            # Tạo chi tiết phiếu nhập từ tất cả chi tiết đơn đặt hàng
            created_details = []
            for po_detail in purchase_order.details.filter(is_deleted=False):
                # Tính số lượng còn lại có thể nhập
                remaining_quantity = po_detail.quantity - po_detail.received_quantity
                if remaining_quantity <= 0:
                    continue  # Bỏ qua nếu đã nhập đủ
                
                # Kiểm tra xem sản phẩm đã tồn tại trong phiếu nhập kho chưa
                existing_detail = goods_receipt.details.filter(
                    product_variant=po_detail.product_variant,
                    is_deleted=False
                ).first()
                
                if existing_detail:
                    # Nếu sản phẩm đã tồn tại, bỏ qua
                    continue
                
                # Tạo chi tiết phiếu nhập
                detail_data = {
                    'goods_receipt': goods_receipt.id,
                    'purchase_order_detail': po_detail.id,
                    'product_variant': po_detail.product_variant.id,
                    'ordered_quantity': po_detail.quantity,  # Lấy từ purchase_order_detail
                    'received_quantity': 0,  # Mặc định 0
                    'accepted_quantity': 0,  # Mặc định 0
                    'rejected_quantity': 0,  # Mặc định 0
                    'unit_price': po_detail.unit_price,  # Lấy từ purchase_order_detail
                    'discount_percent': po_detail.discount_percent,  # Lấy từ purchase_order_detail
                    'tax_percent': po_detail.tax_percent,  # Lấy từ purchase_order_detail
                    'quality_status': 'pending',
                    'quality_notes': '',
                    'notes': f"Tự động tạo từ đơn đặt hàng {purchase_order.po_number}"
                }
                
                detail_serializer = GoodsReceiptDetailCreateSerializer(data=detail_data)
                detail_serializer.is_valid(raise_exception=True)
                detail = detail_serializer.save()
                created_details.append(detail)
            
            # Cập nhật tổng tiền cho phiếu nhập kho
            # Khi tạo phiếu nhập kho mới, total_amount = 0 vì chưa nhập hàng thực tế
            goods_receipt.subtotal = 0
            goods_receipt.tax_amount = 0
            goods_receipt.discount_amount = 0
            goods_receipt.total_amount = 0
            goods_receipt.save()
            
            # Trả về response với đầy đủ thông tin
            response_serializer = GoodsReceiptSerializer(goods_receipt)
            return Response({
                "message": f"Đã tạo phiếu nhập {goods_receipt.receipt_number} từ đơn đặt hàng {purchase_order.po_number}",
                "goods_receipt": response_serializer.data,
                "created_details_count": len(created_details)
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def update_prices_from_purchase_order(self, request, pk=None):
        """Cập nhật thông tin giá từ đơn đặt hàng"""
        try:
            goods_receipt = self.get_object()
            
            if not goods_receipt.purchase_order:
                return Response(
                    {"detail": "Phiếu nhập này không liên kết với đơn đặt hàng"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            updated_details = []
            
            # Cập nhật thông tin giá cho từng chi tiết
            for detail in goods_receipt.details.filter(is_deleted=False):
                if detail.purchase_order_detail:
                    po_detail = detail.purchase_order_detail
                    
                    # Cập nhật thông tin giá từ đơn đặt hàng
                    detail.unit_price = po_detail.unit_price
                    detail.discount_percent = po_detail.discount_percent
                    detail.tax_percent = po_detail.tax_percent
                    detail.save()
                    
                    updated_details.append({
                        'detail_id': detail.id,
                        'product_name': detail.product_variant.product.name,
                        'unit_price': detail.unit_price,
                        'discount_percent': detail.discount_percent,
                        'tax_percent': detail.tax_percent,
                        'subtotal': detail.subtotal
                    })
            
            # Tính lại tổng tiền cho phiếu nhập kho dựa trên số lượng thực tế đã chấp nhận
            total_subtotal = 0
            total_tax = 0
            total_discount = 0
            
            for detail in goods_receipt.details.filter(is_deleted=False):
                total_subtotal += detail.subtotal
                total_tax += detail.tax_amount
                total_discount += detail.discount_amount
            
            goods_receipt.subtotal = total_subtotal
            goods_receipt.tax_amount = total_tax
            goods_receipt.discount_amount = total_discount
            goods_receipt.total_amount = total_subtotal + total_tax - total_discount
            goods_receipt.save()
            
            return Response({
                "message": "Đã cập nhật thông tin giá từ đơn đặt hàng thành công",
                "updated_details": updated_details,
                "goods_receipt_totals": {
                    "subtotal": goods_receipt.subtotal,
                    "tax_amount": goods_receipt.tax_amount,
                    "discount_amount": goods_receipt.discount_amount,
                    "total_amount": goods_receipt.total_amount
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 