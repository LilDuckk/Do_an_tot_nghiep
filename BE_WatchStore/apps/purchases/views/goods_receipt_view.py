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
            
            # Tạo phiếu nhập kho
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            goods_receipt = serializer.save(
                created_by=request.user,
                updated_by=request.user
            )
            
            # Tạo chi tiết phiếu nhập kho
            total_subtotal = 0
            total_tax = 0
            total_discount = 0
            
            for detail_data in details_data:
                detail_data['goods_receipt'] = goods_receipt.id
                detail_serializer = GoodsReceiptDetailCreateSerializer(data=detail_data)
                detail_serializer.is_valid(raise_exception=True)
                detail = detail_serializer.save()
                
                # Cộng dồn tổng tiền
                total_subtotal += detail.subtotal
                total_tax += detail.tax_amount
                total_discount += detail.discount_amount
            
            # Cập nhật tổng tiền cho phiếu nhập kho
            goods_receipt.subtotal = total_subtotal
            goods_receipt.tax_amount = total_tax
            goods_receipt.discount_amount = total_discount
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
                        notes=f"Nhập kho từ phiếu nhập {goods_receipt.receipt_number}",
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
                            notes=f"Hủy nhập kho từ phiếu nhập {goods_receipt.receipt_number}",
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
        """Xác nhận phiếu nhập kho"""
        try:
            goods_receipt = self.get_object()
            
            if goods_receipt.status not in ['draft', 'pending']:
                return Response(
                    {"detail": "Chỉ có thể xác nhận phiếu nhập kho ở trạng thái nháp hoặc chờ xác nhận"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            goods_receipt.status = 'confirmed'
            goods_receipt.updated_by = request.user
            goods_receipt.save()
            
            serializer = self.get_serializer(goods_receipt)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def update_inventory(self, request, pk=None):
        """Cập nhật tồn kho từ phiếu nhập"""
        try:
            goods_receipt = self.get_object()
            
            if not goods_receipt.can_update_inventory:
                return Response(
                    {"detail": "Chỉ có thể cập nhật tồn kho khi phiếu nhập đã được xác nhận"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            updated_items = []
            
            # Cập nhật tồn kho cho từng chi tiết
            for detail in goods_receipt.details.filter(is_deleted=False):
                if detail.can_update_inventory:
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
                        notes=f"Nhập kho từ phiếu nhập {goods_receipt.receipt_number}",
                        created_by=request.user,
                        updated_by=request.user
                    )
                    
                    # Cập nhật số lượng đã nhận trong purchase order detail
                    if detail.purchase_order_detail:
                        detail.purchase_order_detail.received_quantity += detail.accepted_quantity
                        detail.purchase_order_detail.save()
                    
                    updated_items.append({
                        'product_variant': detail.product_variant.name,
                        'quantity_added': detail.accepted_quantity,
                        'old_stock': old_quantity,
                        'new_stock': inventory.quantity
                    })
            
            # Cập nhật trạng thái phiếu nhập kho
            goods_receipt.status = 'completed'
            goods_receipt.actual_delivery_date = timezone.now()
            goods_receipt.updated_by = request.user
            goods_receipt.save()
            
            return Response({
                "message": "Đã cập nhật tồn kho thành công",
                "updated_items": updated_items
            }, status=status.HTTP_200_OK)
            
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