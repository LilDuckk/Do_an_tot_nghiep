from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import DjangoModelPermissions
from rest_framework import serializers
from rest_framework import status

from apps.inventory.models.inventory import Inventory
from apps.inventory.serializers.inventory_serializer import InventorySerializer

class InventoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet cho quản lý tồn kho
    """
    queryset = Inventory.objects.filter(is_deleted=False)
    serializer_class = InventorySerializer
    permission_classes = [DjangoModelPermissions]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    
    # Các trường có thể lọc
    filterset_fields = ['store', 'product_variant']
    
    # Các trường có thể tìm kiếm
    search_fields = ['product_variant__product__name', 'product_variant__sku', 'store__name']
    
    # Các trường có thể sắp xếp
    ordering_fields = ['quantity', 'last_updated', 'created_at']
    ordering = ['-last_updated']  # Mặc định sắp xếp theo thời gian cập nhật mới nhất

    def get_permissions(self):
        """
        Cho phép xem danh sách và chi tiết mà không cần đăng nhập
        Các thao tác khác yêu cầu đăng nhập
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            return [AllowAny()]
        return [DjangoModelPermissions()]

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