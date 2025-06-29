from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django.db import transaction
from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework.permissions import OR

from apps.orders.models.order import Orders
from apps.orders.models.order_detail import OrderDetail
from apps.orders.serializers.order_serializer import OrderSerializer
from apps.orders.serializers.order_detail_serializer import OrderDetailSerializer
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from apps.core.mixins import SoftDeleteMixin
from apps.stores.models.employee import Employee
from apps.inventory.models.inventory import Inventory
from apps.inventory.models.inventory_transaction import InventoryTransaction

class OrderFilter(filters.FilterSet):
    # Bộ lọc theo thông tin khách hàng
    customer_first_name = filters.CharFilter(field_name='customer__first_name', lookup_expr='icontains')
    customer_last_name = filters.CharFilter(field_name='customer__last_name', lookup_expr='icontains')
    customer_email = filters.CharFilter(field_name='customer__email', lookup_expr='icontains')
    customer_phone = filters.CharFilter(field_name='customer__phone', lookup_expr='icontains')
    
    # Bộ lọc theo cửa hàng
    store_name = filters.CharFilter(field_name='store__name', lookup_expr='icontains')
    
    # Bộ lọc theo nhân viên
    employee_name = filters.CharFilter(field_name='employee__name', lookup_expr='icontains')
    employee_email = filters.CharFilter(field_name='employee__email', lookup_expr='icontains')
    employee_username = filters.CharFilter(field_name='employee__user__username', lookup_expr='icontains')
    
    # Bộ lọc theo ID đơn hàng (thay thế cho order_number)
    order_id = filters.NumberFilter(field_name='id', lookup_expr='exact')
    
    # Bộ lọc theo trạng thái
    status = filters.CharFilter(lookup_expr='iexact')
    
    # Bộ lọc theo phương thức thanh toán
    payment_method = filters.CharFilter(lookup_expr='iexact')
    
    # Bộ lọc theo trạng thái thanh toán
    payment_status = filters.CharFilter(lookup_expr='iexact')
    
    # Bộ lọc theo phương thức vận chuyển
    shipping_method = filters.CharFilter(lookup_expr='icontains')
    
    # Bộ lọc theo ngày đặt hàng
    order_date_from = filters.DateTimeFilter(field_name='order_date', lookup_expr='gte')
    order_date_to = filters.DateTimeFilter(field_name='order_date', lookup_expr='lte')
    
    # Bộ lọc theo ngày tạo
    created_at_from = filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_at_to = filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    # Bộ lọc theo loại đơn hàng (online/offline)
    is_online_order = filters.BooleanFilter()
    
    # Bộ lọc theo tổng tiền
    total_amount_min = filters.NumberFilter(field_name='total_amount', lookup_expr='gte')
    total_amount_max = filters.NumberFilter(field_name='total_amount', lookup_expr='lte')
    
    class Meta:
        model = Orders
        fields = [
            'customer', 'store', 'employee', 'id', 'status', 
            'payment_method', 'payment_status', 'shipping_method', 
            'is_online_order', 'order_date', 'created_at', 'total_amount'
        ]

class OrderViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    queryset = Orders.objects.filter(is_deleted=False)
    serializer_class = OrderSerializer
    filterset_class = OrderFilter
    search_fields = ['id', 'customer__first_name', 'customer__last_name', 'customer__email', 'employee__name', 'employee__email']
    ordering_fields = ['id', 'created_at', 'order_date', 'total_amount']
    ordering = ['-created_at']

    def get_serializer_class(self):
        return OrderSerializer

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết đơn hàng
            return [IsStoreEmployee()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    def get_queryset(self):
        """
        Lọc đơn hàng dựa trên quyền và cửa hàng của người dùng
        """
        queryset = super().get_queryset()
        user = self.request.user

        # Nếu là superuser, trả về tất cả đơn hàng
        if user.is_superuser:
            return queryset

        # Lấy employee của user
        try:
            employee = Employee.objects.get(user=user, is_deleted=False)
            user_store = employee.store
            # Chỉ trả về đơn hàng của cửa hàng người dùng thuộc về
            return queryset.filter(store=user_store)
        except Employee.DoesNotExist:
            return Orders.objects.none()
        
    def perform_destroy(self, instance):
        """
        Soft delete đơn hàng và tất cả các chi tiết đơn hàng liên quan
        Trả lại số lượng sản phẩm vào inventory nếu order có status đã trừ kho
        """
        with transaction.atomic():
            # Kiểm tra xem order có status đã trừ kho không
            if self._get_status_type(instance.status) == "deducted":
                # Trả lại inventory cho tất cả order details
                order_details = OrderDetail.objects.filter(order=instance, is_deleted=False)
                store_id = instance.store.id
                
                for detail in order_details:
                    product_variant_id = detail.product_variant.id
                    quantity = detail.quantity
                    
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
                            unit_price=detail.unit_price,
                            reference_type='order_cancel',
                            reference_id=instance.id,
                            note=f"Hủy đơn hàng - hoàn trả tồn kho: {detail.product_variant.product.name if detail.product_variant.product else detail.product_variant.sku}",
                            created_by=self.request.user,
                            updated_by=self.request.user
                        )
            
            # Xóa mềm tất cả order details liên quan
            order_details = OrderDetail.objects.filter(order=instance, is_deleted=False)
            for detail in order_details:
                detail.delete()

            # Xóa mềm order
            instance.delete()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Tạo đơn hàng mới với xử lý inventory
        """
        try:
            # Lấy dữ liệu từ request
            order_data = request.data.copy()
            order_details_data = order_data.pop('order_details', [])
            
            # Lấy thông tin user và store
            user = request.user
            store_id = order_data.get('store')
            order_status = order_data.get('status', 'pending')
            
            # Tạo serializer cho order
            serializer = self.get_serializer(data=order_data)
            serializer.is_valid(raise_exception=True)
            order = serializer.save(created_by=user, updated_by=user)

            # Tạo order details
            total_amount = 0
            for detail_data in order_details_data:
                detail_data['order'] = order.id
                detail_serializer = OrderDetailSerializer(data=detail_data)
                detail_serializer.is_valid(raise_exception=True)
                detail = detail_serializer.save()
                total_amount += detail.final_price

            # Cập nhật tổng tiền cho order
            order.total_amount = total_amount
            order.save()

            # Xử lý inventory nếu status là deducted
            if order_status and self._get_status_type(order_status) == "deducted":
                # Nếu status là deducted, cần trừ inventory
                order_details = request.data.get('order_details', [])
                if order_details:
                    # Tạo temporary order details để xử lý inventory
                    temp_details = []
                    for detail_data in order_details:
                        temp_details.append({
                            'product_variant_id': detail_data.get('product_variant'),
                            'quantity': detail_data.get('quantity', 0)
                        })
                    
                    # Kiểm tra inventory trước khi trừ
                    for detail in temp_details:
                        if not detail['quantity']:
                            continue
                            
                        inventory = Inventory.objects.select_for_update().filter(
                            store_id=store_id,
                            product_variant_id=detail['product_variant_id'],
                            is_deleted=False
                        ).first()
                        
                        if not inventory:
                            transaction.set_rollback(True)
                            return Response(
                                {"detail": f"Không tìm thấy tồn kho cho sản phẩm này tại cửa hàng"},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        
                        if inventory.quantity < detail['quantity']:
                            transaction.set_rollback(True)
                            return Response(
                                {"detail": f"Số lượng sản phẩm trong kho không đủ"},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    
                    # Trừ inventory sau khi kiểm tra
                    for detail in temp_details:
                        if not detail['quantity']:
                            continue
                            
                        inventory = Inventory.objects.select_for_update().filter(
                            store_id=store_id,
                            product_variant_id=detail['product_variant_id'],
                            is_deleted=False
                        ).first()
                        
                        inventory.quantity -= detail['quantity']
                        inventory.updated_by = user
                        inventory.save()
                        
                        # Tạo inventory transaction
                        InventoryTransaction.objects.create(
                            inventory=inventory,
                            transaction_type='OUT',
                            quantity=detail['quantity'],
                            reference_type='order',
                            reference_id=order.id,
                            note=f"Tạo đơn hàng - trừ tồn kho: {inventory.product_variant.product.name if inventory.product_variant.product else inventory.product_variant.sku}",
                            created_by=user,
                            updated_by=user
                        )

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Rollback transaction nếu có lỗi
            transaction.set_rollback(True)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        """
        Cập nhật đơn hàng với xử lý inventory
        """
        try:
            instance = self.get_object()
            user = request.user
            
            # Lưu trạng thái cũ
            old_status = instance.status
            
            # Cập nhật order
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            order = serializer.save(updated_by=user)
            
            # Lấy trạng thái mới
            new_status = order.status

            # Xử lý inventory dựa trên thay đổi status
            if old_status != new_status:
                # Lấy tất cả order details của đơn hàng
                order_details = OrderDetail.objects.filter(order=instance, is_deleted=False)
                store_id = instance.store.id
                
                # Xác định status cũ và mới để quyết định xử lý inventory
                old_status_type = self._get_status_type(old_status)
                new_status_type = self._get_status_type(new_status)
                
                # Nếu chuyển từ trạng thái đã trừ kho sang trạng thái trả lại kho
                if old_status_type == "deducted" and new_status_type == "returned":
                    self._return_inventory_to_stock(order_details, store_id, user, instance.id)
                
                # Nếu chuyển từ trạng thái chưa trừ kho sang trạng thái trừ kho
                elif old_status_type == "returned" and new_status_type == "deducted":
                    self._deduct_inventory_from_stock(order_details, store_id, user, instance.id)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            transaction.set_rollback(True)
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
    
    def _deduct_inventory_from_stock(self, order_details, store_id, user, order_id):
        """
        Trừ số lượng sản phẩm khỏi inventory
        """
        for detail in order_details:
            product_variant_id = detail.product_variant.id
            quantity = detail.quantity
            
            # Kiểm tra và cập nhật tồn kho
            inventory = Inventory.objects.select_for_update().filter(
                store_id=store_id,
                product_variant_id=product_variant_id,
                is_deleted=False
            ).first()
            
            if inventory:
                if inventory.quantity >= quantity:
                    inventory.quantity -= quantity
                    inventory.updated_by = user
                    inventory.save()
                    
                    # Tạo inventory transaction
                    InventoryTransaction.objects.create(
                        inventory=inventory,
                        transaction_type='OUT',
                        quantity=quantity,
                        unit_price=detail.unit_price,
                        reference_type='order',
                        reference_id=order_id,
                        note=f"Cập nhật đơn hàng - trừ tồn kho: {detail.product_variant.product.name if detail.product_variant.product else detail.product_variant.sku}",
                        created_by=user,
                        updated_by=user
                    )
                else:
                    # Rollback transaction nếu không đủ hàng
                    transaction.set_rollback(True)
                    raise Exception(f"Số lượng sản phẩm trong kho không đủ để xử lý đơn hàng")
            else:
                # Rollback transaction nếu không tìm thấy inventory
                transaction.set_rollback(True)
                raise Exception(f"Không tìm thấy tồn kho cho sản phẩm này tại cửa hàng")
    
    def _return_inventory_to_stock(self, order_details, store_id, user, order_id):
        """
        Trả lại số lượng sản phẩm vào inventory
        """
        for detail in order_details:
            product_variant_id = detail.product_variant.id
            quantity = detail.quantity
            
            # Tìm và cập nhật tồn kho
            inventory = Inventory.objects.select_for_update().filter(
                store_id=store_id,
                product_variant_id=product_variant_id,
                is_deleted=False
            ).first()
            
            if inventory:
                inventory.quantity += quantity
                inventory.updated_by = user
                inventory.save()
                
                # Tạo inventory transaction
                InventoryTransaction.objects.create(
                    inventory=inventory,
                    transaction_type='IN',
                    quantity=quantity,
                    unit_price=detail.unit_price,
                    reference_type='order_cancel',
                    reference_id=order_id,
                    note=f"Cập nhật đơn hàng - hoàn trả tồn kho: {detail.product_variant.product.name if detail.product_variant.product else detail.product_variant.sku}",
                    created_by=user,
                    updated_by=user
                )
            else:
                # Rollback transaction nếu không tìm thấy inventory
                transaction.set_rollback(True)
                raise Exception(f"Không tìm thấy tồn kho cho sản phẩm này tại cửa hàng")

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        """Lấy tất cả đơn hàng không phân trang"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def order_details(self, request, pk=None):
        """Lấy chi tiết đơn hàng"""
        order = self.get_object()
        order_details = OrderDetail.objects.filter(order=order, is_deleted=False)
        serializer = OrderDetailSerializer(order_details, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel_order(self, request, pk=None):
        """Hủy đơn hàng"""
        order = self.get_object()
        
        if order.status == 'cancelled':
            return Response(
                {'error': 'Đơn hàng đã được hủy trước đó'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if order.status == 'delivered':
            return Response(
                {'error': 'Không thể hủy đơn hàng đã giao'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Cập nhật trạng thái
        order.status = 'cancelled'
        order.updated_by = request.user
        order.save()
        
        return Response({
            'message': f'Đã hủy đơn hàng #{order.id}',
            'order': OrderSerializer(order).data
        })

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Thống kê đơn hàng"""
        queryset = self.get_queryset()
        
        # Thống kê theo trạng thái
        status_stats = queryset.values('status').annotate(
            count=Count('id'),
            total_amount=Sum('total_amount')
        )
        
        # Thống kê theo cửa hàng
        store_stats = queryset.values('store__name').annotate(
            count=Count('id'),
            total_amount=Sum('total_amount')
        ).filter(store__isnull=False)
        
        # Thống kê theo thời gian
        today = timezone.now().date()
        today_orders = queryset.filter(order_date__date=today)
        today_stats = {
            'count': today_orders.count(),
            'total_amount': today_orders.aggregate(total=Sum('total_amount'))['total'] or 0
        }
        
        statistics_data = {
            'total_orders': queryset.count(),
            'total_revenue': queryset.aggregate(total=Sum('total_amount'))['total'] or 0,
            'today_stats': today_stats,
            'status_statistics': status_stats,
            'store_statistics': store_stats
        }
        
        return Response(statistics_data) 