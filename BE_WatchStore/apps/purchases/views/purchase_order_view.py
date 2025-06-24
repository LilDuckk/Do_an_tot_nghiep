from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django.db import transaction
from django.utils import timezone
from rest_framework.permissions import OR

from apps.purchases.models.purchase_order import PurchaseOrder
from apps.purchases.models.purchase_order_detail import PurchaseOrderDetail
from apps.purchases.serializers.purchase_order_serializer import (
    PurchaseOrderSerializer, 
    PurchaseOrderListSerializer
)
from apps.purchases.serializers.purchase_order_detail_serializer import (
    PurchaseOrderDetailCreateSerializer
)
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from apps.core.mixins import SoftDeleteMixin
from apps.stores.models.employee import Employee
from apps.inventory.models.inventory import Inventory


class PurchaseOrderFilter(filters.FilterSet):
    """Bộ lọc cho PurchaseOrder"""
    # Bộ lọc theo nhà cung cấp
    supplier_name = filters.CharFilter(field_name='supplier__name', lookup_expr='icontains')
    supplier_email = filters.CharFilter(field_name='supplier__email', lookup_expr='icontains')
    supplier_phone = filters.CharFilter(field_name='supplier__phone', lookup_expr='icontains')
    
    # Bộ lọc theo cửa hàng
    store_name = filters.CharFilter(field_name='store__name', lookup_expr='icontains')
    
    # Bộ lọc theo nhân viên
    employee_name = filters.CharFilter(field_name='employee__name', lookup_expr='icontains')
    employee_email = filters.CharFilter(field_name='employee__email', lookup_expr='icontains')
    
    # Bộ lọc theo mã đơn đặt hàng
    po_number = filters.CharFilter(lookup_expr='icontains')
    
    # Bộ lọc theo trạng thái
    status = filters.CharFilter(lookup_expr='iexact')
    payment_status = filters.CharFilter(lookup_expr='iexact')
    
    # Bộ lọc theo ngày
    order_date_from = filters.DateTimeFilter(field_name='order_date', lookup_expr='gte')
    order_date_to = filters.DateTimeFilter(field_name='order_date', lookup_expr='lte')
    expected_delivery_date_from = filters.DateTimeFilter(field_name='expected_delivery_date', lookup_expr='gte')
    expected_delivery_date_to = filters.DateTimeFilter(field_name='expected_delivery_date', lookup_expr='lte')
    created_at_from = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_at_to = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    # Bộ lọc theo số tiền
    total_amount_min = filters.NumberFilter(field_name='total_amount', lookup_expr='gte')
    total_amount_max = filters.NumberFilter(field_name='total_amount', lookup_expr='lte')
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'supplier', 'store', 'employee', 'po_number', 'status', 'payment_status',
            'order_date', 'expected_delivery_date', 'created_at', 'total_amount'
        ]


class PurchaseOrderViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    """
    ViewSet cho PurchaseOrder
    """
    queryset = PurchaseOrder.objects.filter(is_deleted=False)
    serializer_class = PurchaseOrderSerializer
    filterset_class = PurchaseOrderFilter
    search_fields = [
        'po_number', 'supplier__name', 'supplier__email', 'store__name', 
        'employee__name', 'employee__email', 'notes'
    ]
    ordering_fields = [
        'po_number', 'order_date', 'expected_delivery_date', 'total_amount', 'created_at'
    ]
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép user đã đăng nhập có quyền xem danh sách và chi tiết đơn đặt hàng
            return [IsStoreEmployee()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    def get_queryset(self):
        """Lọc đơn đặt hàng dựa trên quyền và cửa hàng của người dùng"""
        queryset = super().get_queryset()
        user = self.request.user

        # Nếu là superuser, trả về tất cả đơn đặt hàng
        if user.is_superuser:
            return queryset

        # Lấy employee của user
        try:
            employee = Employee.objects.get(user=user, is_deleted=False)
            user_store = employee.store
            # Chỉ trả về đơn đặt hàng của cửa hàng người dùng thuộc về
            return queryset.filter(store=user_store)
        except Employee.DoesNotExist:
            return PurchaseOrder.objects.none()

    def get_serializer_class(self):
        """Chọn serializer phù hợp"""
        if self.action == 'list':
            return PurchaseOrderListSerializer
        return PurchaseOrderSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Tạo đơn đặt hàng mới với chi tiết"""
        try:
            # Lấy dữ liệu từ request
            details_data = request.data.pop('details', [])
            
            # Tạo đơn đặt hàng
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            purchase_order = serializer.save(
                created_by=request.user,
                updated_by=request.user
            )
            
            # Tạo chi tiết đơn đặt hàng
            total_subtotal = 0
            total_tax = 0
            total_discount = 0
            
            for detail_data in details_data:
                detail_data['purchase_order'] = purchase_order.id
                detail_serializer = PurchaseOrderDetailCreateSerializer(data=detail_data)
                detail_serializer.is_valid(raise_exception=True)
                detail = detail_serializer.save()
                
                # Cộng dồn tổng tiền
                total_subtotal += detail.subtotal
                total_tax += detail.tax_amount
                total_discount += detail.discount_amount
            
            # Cập nhật tổng tiền cho đơn đặt hàng
            purchase_order.subtotal = total_subtotal
            purchase_order.tax_amount = total_tax
            purchase_order.discount_amount = total_discount
            purchase_order.save()
            
            # Trả về response với đầy đủ thông tin
            response_serializer = PurchaseOrderSerializer(purchase_order)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            transaction.set_rollback(True)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """Cập nhật đơn đặt hàng"""
        try:
            instance = self.get_object()
            old_status = instance.status
            new_status = request.data.get('status', old_status)
            
            # Cập nhật đơn đặt hàng
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            purchase_order = serializer.save(updated_by=request.user)
            
            # Xử lý khi chuyển trạng thái sang 'ordered'
            if old_status != 'ordered' and new_status == 'ordered':
                # Có thể thêm logic xử lý khi đơn hàng được xác nhận
                pass
            
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            transaction.set_rollback(True)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def confirm_order(self, request, pk=None):
        """Xác nhận đơn đặt hàng"""
        try:
            purchase_order = self.get_object()
            
            if purchase_order.status not in ['draft', 'pending']:
                return Response(
                    {"detail": "Chỉ có thể xác nhận đơn hàng ở trạng thái nháp hoặc chờ xác nhận"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            purchase_order.status = 'ordered'
            purchase_order.updated_by = request.user
            purchase_order.save()
            
            serializer = self.get_serializer(purchase_order)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def cancel_order(self, request, pk=None):
        """Hủy đơn đặt hàng"""
        try:
            purchase_order = self.get_object()
            
            if purchase_order.status in ['completed', 'cancelled']:
                return Response(
                    {"detail": "Không thể hủy đơn hàng đã hoàn thành hoặc đã hủy"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            purchase_order.status = 'cancelled'
            purchase_order.updated_by = request.user
            purchase_order.save()
            
            serializer = self.get_serializer(purchase_order)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def create_receipt(self, request, pk=None):
        """Tạo phiếu nhập từ đơn đặt hàng"""
        try:
            purchase_order = self.get_object()
            
            # Kiểm tra xem đã có phiếu nhập chưa
            existing_receipt = purchase_order.goods_receipts.filter(is_deleted=False).first()
            if existing_receipt:
                return Response(
                    {"detail": f"Đã tồn tại phiếu nhập {existing_receipt.receipt_number} cho đơn đặt hàng này"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Kiểm tra trạng thái đơn đặt hàng
            if purchase_order.status not in ['ordered', 'confirmed', 'partially_received']:
                return Response(
                    {"detail": "Chỉ có thể tạo phiếu nhập cho đơn đặt hàng ở trạng thái đã đặt, đã xác nhận hoặc đã nhập một phần"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Kiểm tra xem có chi tiết nào còn có thể nhập không
            has_receivable_items = False
            for po_detail in purchase_order.details.filter(is_deleted=False):
                if po_detail.quantity > po_detail.received_quantity:
                    has_receivable_items = True
                    break
            
            if not has_receivable_items:
                return Response(
                    {"detail": "Tất cả hàng trong đơn đặt hàng đã được nhập đủ"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Tạo phiếu nhập kho
            from apps.purchases.models.goods_receipt import GoodsReceipt
            from apps.purchases.serializers.goods_receipt_serializer import GoodsReceiptSerializer
            from apps.purchases.serializers.goods_receipt_detail_serializer import GoodsReceiptDetailCreateSerializer
            
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
            receipt_serializer = GoodsReceiptSerializer(data=receipt_data)
            receipt_serializer.is_valid(raise_exception=True)
            goods_receipt = receipt_serializer.save(
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
                    'unit_price': 0,  # Mặc định 0
                    'discount_percent': 0,  # Mặc định 0
                    'tax_percent': 0,  # Mặc định 0
                    'quality_status': 'pending',
                    'quality_notes': '',
                    'notes': f"Tự động tạo từ đơn đặt hàng {purchase_order.po_number}"
                }
                
                detail_serializer = GoodsReceiptDetailCreateSerializer(data=detail_data)
                detail_serializer.is_valid(raise_exception=True)
                detail = detail_serializer.save()
                created_details.append(detail)
            
            # Cập nhật tổng tiền cho phiếu nhập kho
            total_subtotal = sum(detail.subtotal for detail in created_details)
            total_tax = sum(detail.tax_amount for detail in created_details)
            total_discount = sum(detail.discount_amount for detail in created_details)
            
            goods_receipt.subtotal = total_subtotal
            goods_receipt.tax_amount = total_tax
            goods_receipt.discount_amount = total_discount
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

    @action(detail=True, methods=['get'])
    def get_receipt_info(self, request, pk=None):
        """Lấy thông tin phiếu nhập của đơn đặt hàng"""
        try:
            purchase_order = self.get_object()
            
            # Tìm phiếu nhập liên quan
            goods_receipt = purchase_order.goods_receipts.filter(is_deleted=False).first()
            
            if not goods_receipt:
                return Response({
                    "has_receipt": False,
                    "message": "Chưa có phiếu nhập cho đơn đặt hàng này"
                }, status=status.HTTP_200_OK)
            
            # Thống kê chi tiết
            details = goods_receipt.details.filter(is_deleted=False)
            total_items = details.count()
            total_ordered = sum(detail.ordered_quantity for detail in details)
            total_received = sum(detail.received_quantity for detail in details)
            total_accepted = sum(detail.accepted_quantity for detail in details)
            total_rejected = sum(detail.rejected_quantity for detail in details)
            
            receipt_info = {
                "has_receipt": True,
                "receipt": {
                    'id': goods_receipt.id,
                    'receipt_number': goods_receipt.receipt_number,
                    'status': goods_receipt.status,
                    'receipt_date': goods_receipt.receipt_date,
                    'employee_name': goods_receipt.employee.name if goods_receipt.employee else None,
                    'notes': goods_receipt.notes
                },
                "summary": {
                    'total_items': total_items,
                    'total_ordered': total_ordered,
                    'total_received': total_received,
                    'total_accepted': total_accepted,
                    'total_rejected': total_rejected,
                    'receipt_progress': (total_received / total_ordered * 100) if total_ordered > 0 else 0,
                    'acceptance_rate': (total_accepted / total_received * 100) if total_received > 0 else 0
                }
            }
            
            return Response(receipt_info, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Thống kê đơn đặt hàng"""
        try:
            purchase_order = self.get_object()
            
            # Thống kê chi tiết
            details = purchase_order.details.all()
            total_items = details.count()
            total_quantity = sum(detail.quantity for detail in details)
            received_quantity = sum(detail.received_quantity for detail in details)
            remaining_quantity = total_quantity - received_quantity
            
            # Thống kê theo trạng thái
            fully_received = sum(1 for detail in details if detail.is_fully_received)
            partially_received = sum(1 for detail in details if detail.received_quantity > 0 and not detail.is_fully_received)
            not_received = total_items - fully_received - partially_received
            
            statistics = {
                'total_items': total_items,
                'total_quantity': total_quantity,
                'received_quantity': received_quantity,
                'remaining_quantity': remaining_quantity,
                'fully_received_items': fully_received,
                'partially_received_items': partially_received,
                'not_received_items': not_received,
                'receipt_progress': (received_quantity / total_quantity * 100) if total_quantity > 0 else 0
            }
            
            return Response(statistics, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def get_order_details(self, request, pk=None):
        """Lấy danh sách chi tiết đơn đặt hàng với thông tin phiếu nhập"""
        try:
            purchase_order = self.get_object()
            
            details = []
            for detail in purchase_order.details.filter(is_deleted=False):
                detail_info = {
                    'id': detail.id,
                    'product_variant': {
                        'id': detail.product_variant.id,
                        'name': detail.product_variant.name,
                        'sku': detail.product_variant.sku,
                        'product_name': detail.product_variant.product.name
                    },
                    'quantity': detail.quantity,
                    'received_quantity': detail.received_quantity,
                    'remaining_quantity': detail.quantity - detail.received_quantity,
                    'unit_price': detail.unit_price,
                    'discount_percent': detail.discount_percent,
                    'tax_percent': detail.tax_percent,
                    'subtotal': detail.subtotal,
                    'is_fully_received': detail.is_fully_received,
                    'receipt_progress': (detail.received_quantity / detail.quantity * 100) if detail.quantity > 0 else 0
                }
                
                # Thông tin phiếu nhập nếu có
                goods_receipt = purchase_order.goods_receipts.filter(is_deleted=False).first()
                if goods_receipt:
                    receipt_detail = goods_receipt.details.filter(
                        purchase_order_detail=detail,
                        is_deleted=False
                    ).first()
                    
                    if receipt_detail:
                        detail_info['receipt_detail'] = {
                            'id': receipt_detail.id,
                            'received_quantity': receipt_detail.received_quantity,
                            'accepted_quantity': receipt_detail.accepted_quantity,
                            'rejected_quantity': receipt_detail.rejected_quantity,
                            'quality_status': receipt_detail.quality_status,
                            'quality_notes': receipt_detail.quality_notes
                        }
                    else:
                        detail_info['receipt_detail'] = None
                else:
                    detail_info['receipt_detail'] = None
                
                details.append(detail_info)
            
            return Response({
                'order_id': purchase_order.id,
                'po_number': purchase_order.po_number,
                'details': details,
                'total_details': len(details)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def get_order_summary(self, request, pk=None):
        """Lấy thông tin tổng quan về đơn đặt hàng"""
        try:
            purchase_order = self.get_object()
            
            # Thống kê chi tiết
            details = purchase_order.details.filter(is_deleted=False)
            total_items = details.count()
            total_quantity = sum(detail.quantity for detail in details)
            total_received = sum(detail.received_quantity for detail in details)
            total_remaining = total_quantity - total_received
            
            # Thống kê theo trạng thái nhận hàng
            fully_received = sum(1 for detail in details if detail.is_fully_received)
            partially_received = sum(1 for detail in details if detail.received_quantity > 0 and not detail.is_fully_received)
            not_received = total_items - fully_received - partially_received
            
            # Thông tin phiếu nhập
            goods_receipt = purchase_order.goods_receipts.filter(is_deleted=False).first()
            receipt_info = None
            if goods_receipt:
                receipt_details = goods_receipt.details.filter(is_deleted=False)
                total_accepted = sum(detail.accepted_quantity for detail in receipt_details)
                total_rejected = sum(detail.rejected_quantity for detail in receipt_details)
                
                receipt_info = {
                    'id': goods_receipt.id,
                    'receipt_number': goods_receipt.receipt_number,
                    'status': goods_receipt.status,
                    'receipt_date': goods_receipt.receipt_date,
                    'total_accepted': total_accepted,
                    'total_rejected': total_rejected,
                    'acceptance_rate': (total_accepted / total_received * 100) if total_received > 0 else 0
                }
            
            summary = {
                'order_info': {
                    'id': purchase_order.id,
                    'po_number': purchase_order.po_number,
                    'status': purchase_order.status,
                    'order_date': purchase_order.order_date,
                    'expected_delivery_date': purchase_order.expected_delivery_date,
                    'supplier_name': purchase_order.supplier.name,
                    'store_name': purchase_order.store.name,
                    'employee_name': purchase_order.employee.name if purchase_order.employee else None
                },
                'quantity_summary': {
                    'total_items': total_items,
                    'total_quantity': total_quantity,
                    'total_received': total_received,
                    'total_remaining': total_remaining,
                    'receipt_progress': (total_received / total_quantity * 100) if total_quantity > 0 else 0
                },
                'receipt_status': {
                    'fully_received_items': fully_received,
                    'partially_received_items': partially_received,
                    'not_received_items': not_received,
                    'receipt_progress_percentage': (total_received / total_quantity * 100) if total_quantity > 0 else 0
                },
                'financial_summary': {
                    'subtotal': purchase_order.subtotal,
                    'tax_amount': purchase_order.tax_amount,
                    'discount_amount': purchase_order.discount_amount,
                    'total_amount': purchase_order.total_amount
                },
                'receipt_info': receipt_info
            }
            
            return Response(summary, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def get_orders_without_receipt(self, request):
        """Lấy danh sách đơn hàng chưa có phiếu nhập kho"""
        try:
            # Lọc đơn đặt hàng theo quyền người dùng
            user = request.user
            if user.is_superuser:
                purchase_orders = PurchaseOrder.objects.filter(is_deleted=False)
            else:
                try:
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
            
            # Lọc đơn hàng chưa có phiếu nhập kho
            orders_without_receipt = []
            for po in purchase_orders:
                # Kiểm tra xem đã có phiếu nhập kho chưa (is_deleted=False)
                existing_receipt = po.goods_receipts.filter(is_deleted=False).first()
                
                if not existing_receipt:
                    # Tính toán thông tin đơn hàng
                    details = po.details.filter(is_deleted=False)
                    total_items = details.count()
                    total_quantity = sum(detail.quantity for detail in details)
                    total_received = sum(detail.received_quantity for detail in details)
                    remaining_quantity = total_quantity - total_received
                    
                    # Kiểm tra xem có chi tiết nào còn có thể nhập không
                    has_receivable_items = any(
                        detail.quantity > detail.received_quantity 
                        for detail in details
                    )
                    
                    if has_receivable_items:
                        orders_without_receipt.append({
                            'id': po.id,
                            'po_number': po.po_number,
                            'supplier': {
                                'id': po.supplier.id,
                                'name': po.supplier.name,
                                'email': po.supplier.email,
                                'phone': po.supplier.phone
                            },
                            'store': {
                                'id': po.store.id,
                                'name': po.store.name
                            },
                            'employee': {
                                'id': po.employee.id,
                                'name': po.employee.name,
                                'employee_code': po.employee.employee_code,
                                'position': po.employee.position
                            } if po.employee else None,
                            'order_date': po.order_date,
                            'expected_delivery_date': po.expected_delivery_date,
                            'status': po.status,
                            'payment_status': po.payment_status,
                            'total_amount': po.total_amount,
                            'summary': {
                                'total_items': total_items,
                                'total_quantity': total_quantity,
                                'total_received': total_received,
                                'remaining_quantity': remaining_quantity,
                                'receipt_progress': (total_received / total_quantity * 100) if total_quantity > 0 else 0,
                                'can_create_receipt': po.status in ['ordered', 'confirmed', 'partially_received']
                            },
                            'created_at': po.created_at,
                            'updated_at': po.updated_at
                        })
            
            # Sắp xếp theo ngày đặt hàng mới nhất
            orders_without_receipt.sort(key=lambda x: x['order_date'], reverse=True)
            
            # Phân trang
            from rest_framework.pagination import PageNumberPagination
            paginator = PageNumberPagination()
            paginator.page_size = 10
            
            # Lấy page từ query params
            page = request.query_params.get('page', 1)
            try:
                page = int(page)
            except ValueError:
                page = 1
            
            # Tính toán phân trang
            start_index = (page - 1) * paginator.page_size
            end_index = start_index + paginator.page_size
            paginated_orders = orders_without_receipt[start_index:end_index]
            
            # Tạo response với phân trang
            response_data = {
                'count': len(orders_without_receipt),
                'next': f"?page={page + 1}" if end_index < len(orders_without_receipt) else None,
                'previous': f"?page={page - 1}" if page > 1 else None,
                'results': paginated_orders,
                'summary': {
                    'total_orders': len(orders_without_receipt),
                    'orders_can_create_receipt': sum(1 for order in orders_without_receipt if order['summary']['can_create_receipt']),
                    'orders_pending_confirmation': sum(1 for order in orders_without_receipt if order['status'] in ['draft', 'pending'])
                }
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 