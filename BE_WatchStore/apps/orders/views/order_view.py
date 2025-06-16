from rest_framework import viewsets, status
from apps.orders.models.order import Orders
from apps.orders.serializers.order_serializer import OrderSerializer
from apps.core.utils.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated
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
    customer_first_name = filters.CharFilter(field_name='customer__first_name', lookup_expr='icontains')
    
    class Meta:
        model = Orders
        fields = ['customer', 'status', 'payment_method', 'customer_first_name', 'store']

class OrderViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    queryset = Orders.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]
    filterset_class = OrderFilter
    search_fields = ['order_number']
    ordering_fields = ['order_number', 'created_at']
    ordering = ['-created_at']

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

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết đơn hàng
            return [IsAuthenticated()]
        return super().get_permissions()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            user = request.user
            store_id = request.data.get('store')
            employee_id_from_request = request.data.get('employee_id')
            employee_to_assign = None

            print(f"Debug - User: {user.username}, is_superuser: {user.is_superuser}")
            print(f"Debug - Store ID: {store_id}")
            print(f"Debug - Employee ID from request: {employee_id_from_request}")

            if user.is_superuser:
                # Nếu là superuser và có gửi employee_id
                if employee_id_from_request:
                    try:
                        employee_to_assign = Employee.objects.get(id=employee_id_from_request, is_deleted=False)
                        print(f"Debug - Superuser assigned employee: {employee_to_assign.id}, {employee_to_assign.user.username}")
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
                        print(f"Debug - Superuser acting as employee: {employee_to_assign.id}, {employee_to_assign.user.username}")
                    except Employee.DoesNotExist:
                        print("Debug - Superuser is not an employee, no employee assigned by default.")
                        # Superuser không phải là employee, employee_to_assign vẫn là None
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

            # Kiểm tra và cập nhật số lượng tồn kho
            order_details = request.data.get('order_details', [])
            inventory_updates = []
            
            for detail in order_details:
                product_variant_id = detail.get('product_variant')
                quantity = detail.get('quantity', 0)  # Mặc định là 0 nếu không có giá trị
                
                # Bỏ qua nếu quantity là 0 hoặc null
                if not quantity:
                    continue
                
                # Kiểm tra tồn kho
                inventory = Inventory.objects.select_for_update().filter(
                    store_id=store_id,
                    product_variant_id=product_variant_id,
                    is_deleted=False
                ).first()
                
                if not inventory:
                    return Response(
                        {"detail": f"Không tìm thấy tồn kho cho sản phẩm này tại cửa hàng"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if inventory.quantity < quantity:
                    return Response(
                        {"detail": f"Số lượng sản phẩm trong kho không đủ"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Lưu thông tin cập nhật tồn kho
                inventory_updates.append({
                    'inventory': inventory,
                    'quantity': quantity
                })

            # Tạo đơn hàng, truyền employee_to_assign vào serializer.save()
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            print(f"Debug - Validated data (before save): {serializer.validated_data}")
            
            # Truyền employee vào serializer.save()
            order = serializer.save(created_by=user, updated_by=user, employee=employee_to_assign)
            print(f"Debug - Created order ID: {order.id}, Assigned Employee: {order.employee}")

            # Cập nhật tồn kho sau khi tạo đơn hàng thành công
            for update in inventory_updates:
                inventory = update['inventory']
                quantity = update['quantity']
                inventory.quantity -= quantity
                inventory.updated_by = user
                inventory.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            # Rollback transaction nếu có lỗi
            transaction.set_rollback(True)
            print(f"Debug - Error during order creation: {str(e)}")
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

            print(f"Debug Update - User: {user.username}, is_superuser: {user.is_superuser}")
            print(f"Debug Update - Order ID: {instance.id}")
            print(f"Debug Update - Store ID from request: {store_id_from_request}")
            print(f"Debug Update - Employee ID from request: {employee_id_from_request}")

            if user.is_superuser:
                # Nếu là superuser và có gửi employee_id
                if employee_id_from_request is not None: # Check if it's explicitly sent, even if null
                    try:
                        employee_to_assign = Employee.objects.get(id=employee_id_from_request, is_deleted=False)
                        print(f"Debug Update - Superuser assigned employee: {employee_to_assign.id}, {employee_to_assign.user.username}")
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
                        print("Debug Update - Superuser explicitly set employee to null.")
                    else:
                        # Superuser does not explicitly set employee_id, keep existing employee or assign if not exists
                        employee_to_assign = instance.employee
                        print(f"Debug Update - Superuser kept existing employee: {employee_to_assign.id if employee_to_assign else 'None'}")

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
                    print(f"Debug Update - Regular user, employee kept as: {employee_to_assign.id if employee_to_assign else 'None'}")
                except Employee.DoesNotExist:
                    return Response(
                        {"detail": "Không tìm thấy thông tin nhân viên của bạn"},
                        status=status.HTTP_403_FORBIDDEN
                    )

            # Tạo serializer với partial=True để cho phép cập nhật từng phần
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            print(f"Debug Update - Validated data (before save): {serializer.validated_data}")

            # Cập nhật order, truyền employee_to_assign vào serializer.save()
            order = serializer.save(updated_by=user, employee=employee_to_assign)
            print(f"Debug Update - Updated order ID: {order.id}, Assigned Employee: {order.employee}")

            # Logic cập nhật tồn kho (giữ nguyên, nhưng cần lấy từ request.data nếu có)
            order_details_data = request.data.get('order_details', None)
            if order_details_data is not None:
                # Cần xử lý chi tiết đơn hàng ở đây nếu muốn cập nhật tồn kho khi PUT
                # Hiện tại, logic này chỉ xử lý khi tạo mới, cần mở rộng cho update nếu cần
                pass # Logic cập nhật tồn kho chi tiết hơn sẽ được thêm nếu cần

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            transaction.set_rollback(True)
            print(f"Debug Update - Error during order update: {str(e)}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 