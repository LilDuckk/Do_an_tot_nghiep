from rest_framework import viewsets, status
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django.db import transaction, models
from rest_framework.permissions import OR

from apps.purchases.models.purchase_order_detail import PurchaseOrderDetail
from apps.purchases.serializers.purchase_order_detail_serializer import (
    PurchaseOrderDetailSerializer,
    PurchaseOrderDetailCreateSerializer
)
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from apps.core.mixins import SoftDeleteMixin


class PurchaseOrderDetailFilter(filters.FilterSet):
    """Bộ lọc cho PurchaseOrderDetail"""
    # Bộ lọc theo đơn đặt hàng
    purchase_order = filters.NumberFilter(field_name='purchase_order', lookup_expr='exact')
    po_number = filters.CharFilter(field_name='purchase_order__po_number', lookup_expr='icontains')
    
    # Bộ lọc theo sản phẩm
    product_variant_name = filters.CharFilter(field_name='product_variant__name', lookup_expr='icontains')
    product_variant_sku = filters.CharFilter(field_name='product_variant__sku', lookup_expr='icontains')
    
    # Bộ lọc theo số lượng
    quantity_min = filters.NumberFilter(field_name='quantity', lookup_expr='gte')
    quantity_max = filters.NumberFilter(field_name='quantity', lookup_expr='lte')
    received_quantity_min = filters.NumberFilter(field_name='received_quantity', lookup_expr='gte')
    received_quantity_max = filters.NumberFilter(field_name='received_quantity', lookup_expr='lte')
    
    # Bộ lọc theo giá
    unit_price_min = filters.NumberFilter(field_name='unit_price', lookup_expr='gte')
    unit_price_max = filters.NumberFilter(field_name='unit_price', lookup_expr='lte')
    
    # Bộ lọc theo trạng thái nhận hàng
    is_fully_received = filters.BooleanFilter(method='filter_fully_received')
    
    class Meta:
        model = PurchaseOrderDetail
        fields = [
            'purchase_order', 'product_variant', 'quantity', 'received_quantity',
            'unit_price', 'discount_percent', 'tax_percent'
        ]
    
    def filter_fully_received(self, queryset, name, value):
        """Lọc theo trạng thái đã nhận đủ hàng"""
        if value is True:
            return queryset.filter(received_quantity__gte=models.F('quantity'))
        elif value is False:
            return queryset.filter(received_quantity__lt=models.F('quantity'))
        return queryset


class PurchaseOrderDetailViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    """
    ViewSet cho PurchaseOrderDetail
    """
    queryset = PurchaseOrderDetail.objects.filter(is_deleted=False)
    serializer_class = PurchaseOrderDetailSerializer
    filterset_class = PurchaseOrderDetailFilter
    search_fields = [
        'purchase_order__po_number', 'product_variant__name', 'product_variant__sku', 'notes'
    ]
    ordering_fields = [
        'quantity', 'received_quantity', 'unit_price', 'subtotal', 'created_at'
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
        """Lọc chi tiết đơn đặt hàng dựa trên quyền và cửa hàng của người dùng"""
        queryset = super().get_queryset()
        user = self.request.user

        # Nếu là superuser, trả về tất cả chi tiết đơn đặt hàng
        if user.is_superuser:
            return queryset

        # Lấy employee của user
        try:
            from apps.stores.models.employee import Employee
            employee = Employee.objects.get(user=user, is_deleted=False)
            user_store = employee.store
            # Chỉ trả về chi tiết đơn đặt hàng của cửa hàng người dùng thuộc về
            return queryset.filter(purchase_order__store=user_store)
        except Employee.DoesNotExist:
            return PurchaseOrderDetail.objects.none()

    def get_serializer_class(self):
        """Chọn serializer phù hợp"""
        if self.action == 'create':
            return PurchaseOrderDetailCreateSerializer
        return PurchaseOrderDetailSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Tạo chi tiết đơn đặt hàng mới"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            detail = serializer.save()
            
            # Cập nhật tổng tiền cho đơn đặt hàng
            purchase_order = detail.purchase_order
            self._update_purchase_order_totals(purchase_order)
            
            response_serializer = PurchaseOrderDetailSerializer(detail)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            transaction.set_rollback(True)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """Cập nhật chi tiết đơn đặt hàng"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            detail = serializer.save()
            
            # Cập nhật tổng tiền cho đơn đặt hàng
            purchase_order = detail.purchase_order
            self._update_purchase_order_totals(purchase_order)
            
            response_serializer = PurchaseOrderDetailSerializer(detail)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            transaction.set_rollback(True)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """Xóa chi tiết đơn đặt hàng"""
        try:
            instance = self.get_object()
            purchase_order = instance.purchase_order
            
            # Xóa chi tiết
            instance.delete()
            
            # Cập nhật tổng tiền cho đơn đặt hàng
            self._update_purchase_order_totals(purchase_order)
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            transaction.set_rollback(True)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def _update_purchase_order_totals(self, purchase_order):
        """Cập nhật tổng tiền cho đơn đặt hàng"""
        details = purchase_order.details.filter(is_deleted=False)
        
        total_subtotal = sum(detail.subtotal for detail in details)
        total_tax = sum(detail.tax_amount for detail in details)
        total_discount = sum(detail.discount_amount for detail in details)
        
        purchase_order.subtotal = total_subtotal
        purchase_order.tax_amount = total_tax
        purchase_order.discount_amount = total_discount
        purchase_order.save() 