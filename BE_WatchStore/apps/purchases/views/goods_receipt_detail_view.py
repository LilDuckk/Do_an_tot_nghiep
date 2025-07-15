from rest_framework import viewsets, status
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django.db import transaction
from rest_framework.permissions import OR

from apps.purchases.models.goods_receipt_detail import GoodsReceiptDetail
from apps.purchases.serializers.goods_receipt_detail_serializer import (
    GoodsReceiptDetailSerializer,
    GoodsReceiptDetailCreateSerializer,
    GoodsReceiptDetailUpdateSerializer
)
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from apps.core.mixins import SoftDeleteMixin


class GoodsReceiptDetailFilter(filters.FilterSet):
    """Bộ lọc cho GoodsReceiptDetail"""
    # Bộ lọc theo phiếu nhập kho
    goods_receipt = filters.NumberFilter(field_name='goods_receipt', lookup_expr='exact')
    receipt_number = filters.CharFilter(field_name='goods_receipt__receipt_number', lookup_expr='icontains')
    
    # Bộ lọc theo đơn đặt hàng
    purchase_order = filters.NumberFilter(field_name='purchase_order_detail__purchase_order', lookup_expr='exact')
    po_number = filters.CharFilter(field_name='purchase_order_detail__purchase_order__po_number', lookup_expr='icontains')
    
    # Bộ lọc theo sản phẩm
    product_variant_name = filters.CharFilter(field_name='product_variant__name', lookup_expr='icontains')
    product_variant_sku = filters.CharFilter(field_name='product_variant__sku', lookup_expr='icontains')
    
    # Bộ lọc theo số lượng
    received_quantity_min = filters.NumberFilter(field_name='received_quantity', lookup_expr='gte')
    received_quantity_max = filters.NumberFilter(field_name='received_quantity', lookup_expr='lte')
    accepted_quantity_min = filters.NumberFilter(field_name='accepted_quantity', lookup_expr='gte')
    accepted_quantity_max = filters.NumberFilter(field_name='accepted_quantity', lookup_expr='lte')
    rejected_quantity_min = filters.NumberFilter(field_name='rejected_quantity', lookup_expr='gte')
    rejected_quantity_max = filters.NumberFilter(field_name='rejected_quantity', lookup_expr='lte')
    
    # Bộ lọc theo giá
    unit_price_min = filters.NumberFilter(field_name='unit_price', lookup_expr='gte')
    unit_price_max = filters.NumberFilter(field_name='unit_price', lookup_expr='lte')
    
    # Bộ lọc theo trạng thái chất lượng
    quality_status = filters.CharFilter(lookup_expr='iexact')
    is_quality_checked = filters.BooleanFilter(method='filter_quality_checked')
    
    class Meta:
        model = GoodsReceiptDetail
        fields = [
            'goods_receipt', 'purchase_order_detail', 'product_variant',
            'received_quantity', 'accepted_quantity', 'rejected_quantity',
            'unit_price', 'quality_status'
        ]
    
    def filter_quality_checked(self, queryset, name, value):
        """Lọc theo trạng thái đã kiểm tra chất lượng"""
        if value is True:
            return queryset.exclude(quality_status='pending')
        elif value is False:
            return queryset.filter(quality_status='pending')
        return queryset


class GoodsReceiptDetailViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    """
    ViewSet cho GoodsReceiptDetail
    """
    queryset = GoodsReceiptDetail.objects.filter(is_deleted=False)
    serializer_class = GoodsReceiptDetailSerializer
    filterset_class = GoodsReceiptDetailFilter
    search_fields = [
        'goods_receipt__receipt_number', 'product_variant__name', 'product_variant__sku',
        'quality_notes', 'batch_number', 'notes'
    ]
    ordering_fields = [
        'received_quantity', 'accepted_quantity', 'rejected_quantity', 'unit_price', 'subtotal', 'created_at'
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
        """Lọc chi tiết phiếu nhập kho dựa trên quyền và cửa hàng của người dùng"""
        queryset = super().get_queryset()
        user = self.request.user

        # Nếu là superuser, trả về tất cả chi tiết phiếu nhập kho
        if user.is_superuser:
            return queryset

        # Lấy employee của user
        try:
            from apps.stores.models.employee import Employee
            employee = Employee.objects.get(user=user, is_deleted=False)
            user_store = employee.store
            # Chỉ trả về chi tiết phiếu nhập kho của cửa hàng người dùng thuộc về
            return queryset.filter(goods_receipt__store=user_store)
        except Employee.DoesNotExist:
            return GoodsReceiptDetail.objects.none()

    def get_serializer_class(self):
        """Chọn serializer phù hợp"""
        if self.action == 'create':
            return GoodsReceiptDetailCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return GoodsReceiptDetailUpdateSerializer
        return GoodsReceiptDetailSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Tạo chi tiết phiếu nhập kho mới"""
        try:
            # Tự động điền goods_receipt từ URL parameter nếu có
            data = request.data.copy()
            if 'goods_receipt' not in data:
                # Thử lấy từ URL parameter
                goods_receipt_id = request.query_params.get('goods_receipt')
                if goods_receipt_id:
                    data['goods_receipt'] = goods_receipt_id
                else:
                    return Response(
                        {"detail": "goods_receipt is required"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            detail = serializer.save()
            
            # Cập nhật tổng tiền cho phiếu nhập kho
            goods_receipt = detail.goods_receipt
            self._update_goods_receipt_totals(goods_receipt)
            
            response_serializer = GoodsReceiptDetailSerializer(detail)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            transaction.set_rollback(True)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """Cập nhật chi tiết phiếu nhập kho"""
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            detail = serializer.save()
            
            # Cập nhật tổng tiền cho phiếu nhập kho
            goods_receipt = detail.goods_receipt
            self._update_goods_receipt_totals(goods_receipt)
            
            response_serializer = GoodsReceiptDetailSerializer(detail)
            return Response(response_serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            transaction.set_rollback(True)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        """Xóa chi tiết phiếu nhập kho"""
        try:
            instance = self.get_object()
            goods_receipt = instance.goods_receipt
            
            # Xóa chi tiết
            instance.delete()
            
            # Cập nhật tổng tiền cho phiếu nhập kho
            self._update_goods_receipt_totals(goods_receipt)
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            transaction.set_rollback(True)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def _update_goods_receipt_totals(self, goods_receipt):
        """Cập nhật tổng tiền cho phiếu nhập kho"""
        details = goods_receipt.details.filter(is_deleted=False)
        
        total_subtotal = sum(detail.subtotal for detail in details)
        total_tax = sum(detail.tax_amount for detail in details)
        total_discount = sum(detail.discount_amount for detail in details)
        
        goods_receipt.subtotal = total_subtotal
        goods_receipt.tax_amount = total_tax
        goods_receipt.discount_amount = total_discount
        goods_receipt.save() 