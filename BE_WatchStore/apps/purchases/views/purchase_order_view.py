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
from apps.inventory.models.inventory_transaction import InventoryTransaction


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