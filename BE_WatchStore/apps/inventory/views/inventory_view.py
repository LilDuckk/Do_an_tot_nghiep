from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework import serializers
from rest_framework import status
from apps.core.utils.permissions import IsAdminUser
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from apps.stores.models.employee import Employee

from apps.inventory.models.inventory import Inventory
from apps.inventory.serializers.inventory_serializer import InventorySerializer

class InventoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho quản lý tồn kho
    """
    queryset = Inventory.objects.filter(is_deleted=False)
    serializer_class = InventorySerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    # Các trường có thể lọc
    filterset_fields = ['store', 'product_variant']
    
    # Các trường có thể tìm kiếm
    search_fields = ['product_variant__product__name', 'product_variant__sku', 'store__name']
    
    # Các trường có thể sắp xếp
    ordering_fields = ['quantity', 'last_updated', 'created_at']
    ordering = ['-last_updated']  # Mặc định sắp xếp theo thời gian cập nhật mới nhất

    def get_queryset(self):
        """
        Lọc dữ liệu tồn kho dựa trên quyền và cửa hàng của người dùng
        """
        queryset = super().get_queryset()
        user = self.request.user

        # print("=== DEBUG INVENTORY VIEW ===")
        # print(f"User ID: {user.id}")
        # print(f"Username: {user.username}")
        # print(f"Is superuser: {user.is_superuser}")
        # print(f"Has view_all_inventory: {user.has_perm('inventory.view_all_inventory')}")
        # print(f"Has view_inventory: {user.has_perm('inventory.view_inventory')}")
        
        # Nếu là superuser hoặc có quyền view_all_inventory, trả về tất cả dữ liệu
        if user.is_superuser or user.has_perm('inventory.view_all_inventory'):
            # print("Returning all inventory data")
            return queryset

        # Lấy employee của user
        try:
            employee = Employee.objects.get(user=user, is_deleted=False)
            user_store = employee.store
            # print(f"Employee found - ID: {employee.id}")
            # print(f"Store ID: {user_store.id}")
            # print(f"Store name: {user_store.name}")

            if user_store and user.has_perm('inventory.view_inventory'):
                # Chỉ trả về dữ liệu tồn kho của cửa hàng người dùng thuộc về
                filtered_queryset = queryset.filter(store=user_store)
                # print(f"Filtered inventory count: {filtered_queryset.count()}")
                # print("Returning filtered inventory data")
                return filtered_queryset
        except Employee.DoesNotExist:
            print("No employee found for this user")
            
        # Nếu người dùng không thuộc cửa hàng nào hoặc không có quyền view_inventory, trả về queryset rỗng
        print("Returning empty queryset")
        return Inventory.objects.none()

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết tồn kho
            return [IsAuthenticated()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_variant = serializer.validated_data['product_variant']
        store = serializer.validated_data['store']
        existing = Inventory.objects.filter(product_variant=product_variant, store=store).first()
        if existing:
            if existing.is_deleted:
                # Khôi phục bản ghi đã xóa mềm và cập nhật lại dữ liệu
                existing.is_deleted = False
                existing.quantity = serializer.validated_data.get('quantity', existing.quantity)
                existing.updated_by = request.user
                existing.save()
                serializer.instance = existing
                response_serializer = self.get_serializer(existing)
                return Response(response_serializer.data, status=status.HTTP_200_OK)
            else:
                raise serializers.ValidationError("Tồn kho cho biến thể này tại cửa hàng này đã tồn tại.")
        # Nếu không có bản ghi nào, tạo mới như bình thường
        serializer.save(created_by=request.user, updated_by=request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_update(self, serializer):
        """
        Tự động gán người cập nhật khi cập nhật
        """
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='list_all', url_name='list_all')
    def list_all(self, request):
        """
        Lấy tất cả tồn kho (không phân trang) với khả năng tìm kiếm và lọc
        """
        queryset = self.get_queryset()
        
        # Áp dụng bộ lọc
        queryset = self.filter_queryset(queryset)
        
        # Áp dụng tìm kiếm
        search_query = request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                product_variant__product__name__icontains=search_query
            ) | queryset.filter(
                product_variant__sku__icontains=search_query
            ) | queryset.filter(
                store__name__icontains=search_query
            )
        
        # Áp dụng sắp xếp
        ordering = request.query_params.get('ordering', '-last_updated')
        if ordering:
            queryset = queryset.order_by(ordering)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        # Chỉ cho phép cập nhật trường quantity
        allowed_fields = {'quantity'}
        data_keys = set(request.data.keys())
        if not data_keys.issubset(allowed_fields):
            return Response({
                'detail': 'Chỉ được phép cập nhật trường quantity.'
            }, status=status.HTTP_400_BAD_REQUEST)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        # Chỉ cho phép cập nhật trường quantity
        allowed_fields = {'quantity'}
        data_keys = set(request.data.keys())
        if not data_keys.issubset(allowed_fields):
            return Response({
                'detail': 'Chỉ được phép cập nhật trường quantity.'
            }, status=status.HTTP_400_BAD_REQUEST)
        return super().partial_update(request, *args, **kwargs) 