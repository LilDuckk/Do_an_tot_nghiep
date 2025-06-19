from rest_framework import viewsets, status
from apps.orders.models.order import Orders
from apps.orders.models.order_detail import OrderDetail
from apps.orders.serializers.order_serializer import OrderSerializer
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, OR
from apps.core.mixins import SoftDeleteMixin
from django_filters import rest_framework as filters
from rest_framework.response import Response
from apps.stores.models.employee import Employee
from apps.inventory.models.inventory import Inventory
from django.db import transaction
from django.utils import timezone
import json
from datetime import datetime

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

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép user đã đăng nhập có quyền xem danh sách và chi tiết đơn hàng
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
            
            # Xóa mềm tất cả order details liên quan
            order_details = OrderDetail.objects.filter(order=instance, is_deleted=False)
            for detail in order_details:
                detail.delete()

            # Xóa mềm order
            instance.delete()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            user = request.user
            store_id = request.data.get('store')
            employee_id_from_request = request.data.get('employee_id')
            employee_to_assign = None

            if user.is_superuser:
                # Nếu là superuser và có gửi employee_id
                if employee_id_from_request:
                    try:
                        employee_to_assign = Employee.objects.get(id=employee_id_from_request, is_deleted=False)
                        # Kiểm tra xem employee có thuộc cửa hàng được chọn không
                        if str(employee_to_assign.store.id) != str(store_id):
                            return Response(
                                {"detail": "Nhân viên được chỉ định không thuộc cửa hàng được chọn"},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    except Employee.DoesNotExist:
                        return Response(
                            {"detail": "Không tìm thấy nhân viên với ID đã cung cấp"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                else:
                    # Nếu superuser không gửi employee_id, mặc định gán cho chính superuser nếu là employee
                    try:
                        employee_to_assign = Employee.objects.get(user=user, is_deleted=False)
                    except Employee.DoesNotExist:
                        # Superuser không phải là employee, employee_to_assign vẫn là None
                        pass
            else:
                # Nếu không phải superuser, chỉ cho phép tạo đơn cho cửa hàng của mình và gán employee tự động
                try:
                    employee_to_assign = Employee.objects.get(user=user, is_deleted=False)
                    if str(employee_to_assign.store.id) != str(store_id):
                        return Response(
                            {"detail": "Bạn chỉ có thể tạo đơn hàng cho cửa hàng của mình"},
                            status=status.HTTP_403_FORBIDDEN
                        )
                except Employee.DoesNotExist:
                    return Response(
                        {"detail": "Không tìm thấy thông tin nhân viên của bạn"},
                        status=status.HTTP_403_FORBIDDEN
                    )

            # Tạo đơn hàng trước
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            order = serializer.save(created_by=user, updated_by=user, employee=employee_to_assign)

            # Kiểm tra status và xử lý inventory nếu cần
            order_status = request.data.get('status')
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
        try:
            instance = self.get_object()
            user = request.user
            store_id_from_request = request.data.get('store', getattr(instance.store, 'id', None))
            employee_id_from_request = request.data.get('employee_id')
            employee_to_assign = None

            # Lưu status cũ để so sánh
            old_status = instance.status
            new_status = request.data.get('status', old_status)

            if user.is_superuser:
                # Nếu là superuser và có gửi employee_id
                if employee_id_from_request is not None: # Check if it's explicitly sent, even if null
                    try:
                        employee_to_assign = Employee.objects.get(id=employee_id_from_request, is_deleted=False)
                        # Kiểm tra xem employee có thuộc cửa hàng được chọn không
                        if str(employee_to_assign.store.id) != str(store_id_from_request):
                            return Response(
                                {"detail": "Nhân viên được chỉ định không thuộc cửa hàng được chọn"},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    except Employee.DoesNotExist:
                        return Response(
                            {"detail": "Không tìm thấy nhân viên với ID đã cung cấp"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                else: # superuser sends employee_id: null or no employee_id
                    # if employee_id is explicitly null, set employee_to_assign to None
                    if 'employee_id' in request.data and request.data['employee_id'] is None:
                        employee_to_assign = None
                    else:
                        # Superuser does not explicitly set employee_id, keep existing employee or assign if not exists
                        employee_to_assign = instance.employee
            else:
                # Nếu không phải superuser, chỉ cho phép cập nhật đơn hàng của mình và giữ nguyên employee
                try:
                    current_employee = Employee.objects.get(user=user, is_deleted=False)
                    if str(current_employee.store.id) != str(store_id_from_request):
                        return Response(
                            {"detail": "Bạn chỉ có thể cập nhật đơn hàng cho cửa hàng của mình"},
                            status=status.HTTP_403_FORBIDDEN
                        )
                    # Employee thường không được phép thay đổi trường employee của order
                    employee_to_assign = instance.employee # Giữ nguyên employee hiện tại của order
                except Employee.DoesNotExist:
                    return Response(
                        {"detail": "Không tìm thấy thông tin nhân viên của bạn"},
                        status=status.HTTP_403_FORBIDDEN
                    )

            # Tạo serializer với partial=True để cho phép cập nhật từng phần
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)

            # Cập nhật order, truyền employee_to_assign vào serializer.save()
            order = serializer.save(updated_by=user, employee=employee_to_assign)

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
                    self._return_inventory_to_stock(order_details, store_id, user)
                
                # Nếu chuyển từ trạng thái chưa trừ kho sang trạng thái trừ kho
                elif old_status_type == "returned" and new_status_type == "deducted":
                    self._deduct_inventory_from_stock(order_details, store_id, user)

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
    
    def _deduct_inventory_from_stock(self, order_details, store_id, user):
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
                else:
                    # Rollback transaction nếu không đủ hàng
                    transaction.set_rollback(True)
                    raise Exception(f"Số lượng sản phẩm trong kho không đủ để xử lý đơn hàng")
            else:
                # Rollback transaction nếu không tìm thấy inventory
                transaction.set_rollback(True)
                raise Exception(f"Không tìm thấy tồn kho cho sản phẩm này tại cửa hàng")
    
    def _return_inventory_to_stock(self, order_details, store_id, user):
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
            else:
                # Rollback transaction nếu không tìm thấy inventory
                transaction.set_rollback(True)
                raise Exception(f"Không tìm thấy tồn kho cho sản phẩm này tại cửa hàng") 