from rest_framework import viewsets
from apps.orders.models.order_detail import OrderDetail
from apps.orders.serializers.order_detail_serializer import OrderDetailSerializer
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, OR
from apps.core.mixins import SoftDeleteMixin
from django.db import transaction
from apps.inventory.models.inventory import Inventory
from apps.inventory.models.inventory_transaction import InventoryTransaction

class OrderDetailViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    queryset = OrderDetail.objects.all()
    serializer_class = OrderDetailSerializer
    filterset_fields = ['order', 'product_variant']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết biến thể
            return [IsStoreEmployee()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    def perform_destroy(self, instance):
        """
        Soft delete order detail và trả lại số lượng sản phẩm vào inventory
        nếu order có status đã trừ kho
        """
        with transaction.atomic():
            # Kiểm tra xem order có status đã trừ kho không
            order = instance.order
            if order and self._get_status_type(order.status) == "deducted":
                # Trả lại inventory cho order detail này
                store_id = order.store.id
                product_variant_id = instance.product_variant.id
                quantity = instance.quantity
                
                # Tìm và cập nhật tồn kho
                inventory = Inventory.objects.select_for_update().filter(
                    store_id=store_id,
                    product_variant_id=product_variant_id,
                    is_deleted=False
                ).first()
                
                if inventory:
                    inventory.quantity += quantity
                    inventory.updated_by = self.request.user
                    inventory.save()
                    
                    # Tạo inventory transaction
                    InventoryTransaction.objects.create(
                        inventory=inventory,
                        transaction_type='IN',
                        quantity=quantity,
                        unit_price=instance.unit_price,
                        reference_type='order_detail_delete',
                        reference_id=instance.id,
                        note=f"Xóa chi tiết đơn hàng - hoàn trả tồn kho: {instance.product_variant.product.name if instance.product_variant.product else instance.product_variant.sku}",
                        created_by=self.request.user,
                        updated_by=self.request.user
                    )
            
            # Xóa mềm order detail
            instance.delete()

    def _get_status_type(self, status):
        """
        Phân loại status thành 2 loại: deducted (đã trừ kho) và returned (trả lại kho)
        """
        deducted_statuses = ["processing", "shipped", "delivered"]
        returned_statuses = ["pending", "cancelled"]
        
        if status in deducted_statuses:
            return "deducted"
        elif status in returned_statuses:
            return "returned"
        else:
            # Nếu status không thuộc 2 loại trên, coi như returned (không trừ kho)
            return "returned"