from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.exceptions import ValidationError
from apps.inventory.models.stock_transfer import StockTransferDetail
from apps.inventory.serializers.stock_transfer_serializer import StockTransferDetailSerializer
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, AllowAny, OR

class StockTransferDetailViewSet(viewsets.ModelViewSet):
    queryset = StockTransferDetail.objects.all()
    serializer_class = StockTransferDetailSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['stock_transfer', 'product_variant']
    search_fields = ['product_variant__name', 'product_variant__sku', 'stock_transfer__note']
    ordering_fields = ['quantity', 'received_quantity', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết
            return [IsStoreEmployee()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        """
        Tạo chi tiết chuyển kho mới
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Kiểm tra xem đã có chi tiết cho sản phẩm này trong chuyển kho chưa
        stock_transfer = serializer.validated_data['stock_transfer']
        product_variant = serializer.validated_data['product_variant']
        
        if StockTransferDetail.objects.filter(stock_transfer=stock_transfer, product_variant=product_variant).exists():
            product_name = getattr(product_variant.product, 'name', None)
            sku = getattr(product_variant, 'sku', None)
            return Response({
                'error': f'Sản phẩm {product_name} (SKU: {sku}) đã có trong chuyển kho này'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Kiểm tra trạng thái chuyển kho
        if stock_transfer.status in ['completed', 'cancelled']:
            return Response({
                'error': 'Không thể thêm chi tiết vào chuyển kho đã hoàn thành hoặc đã hủy'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer.save(created_by=request.user, updated_by=request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        Cập nhật chi tiết chuyển kho
        """
        instance = self.get_object()
        
        # Kiểm tra trạng thái chuyển kho
        if instance.stock_transfer.status in ['completed', 'cancelled']:
            return Response({
                'error': 'Không thể cập nhật chi tiết của chuyển kho đã hoàn thành hoặc đã hủy'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(instance, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        """
        Cập nhật một phần chi tiết chuyển kho
        """
        instance = self.get_object()
        
        # Kiểm tra trạng thái chuyển kho
        if instance.stock_transfer.status in ['completed', 'cancelled']:
            return Response({
                'error': 'Không thể cập nhật chi tiết của chuyển kho đã hoàn thành hoặc đã hủy'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """
        Xóa chi tiết chuyển kho
        """
        instance = self.get_object()
        
        # Kiểm tra trạng thái chuyển kho
        if instance.stock_transfer.status in ['completed', 'cancelled']:
            return Response({
                'error': 'Không thể xóa chi tiết của chuyển kho đã hoàn thành hoặc đã hủy'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def by_stock_transfer(self, request):
        """
        Lấy danh sách chi tiết theo chuyển kho
        """
        stock_transfer_id = request.query_params.get('stock_transfer_id')
        
        if not stock_transfer_id:
            return Response({
                'error': 'stock_transfer_id là bắt buộc'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(stock_transfer_id=stock_transfer_id)
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'stock_transfer_id': stock_transfer_id,
            'details': serializer.data,
            'total_count': queryset.count()
        })

    @action(detail=False, methods=['get'])
    def by_product_variant(self, request):
        """
        Lấy danh sách chi tiết theo sản phẩm
        """
        product_variant_id = request.query_params.get('product_variant_id')
        
        if not product_variant_id:
            return Response({
                'error': 'product_variant_id là bắt buộc'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(product_variant_id=product_variant_id)
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'product_variant_id': product_variant_id,
            'details': serializer.data,
            'total_count': queryset.count()
        })

    @action(detail=True, methods=['patch'])
    def update_received_quantity(self, request, pk=None):
        """
        Cập nhật số lượng đã nhận cho chi tiết chuyển kho
        """
        detail = self.get_object()
        
        # Kiểm tra trạng thái chuyển kho
        if detail.stock_transfer.status in ['completed', 'cancelled']:
            return Response({
                'error': 'Không thể cập nhật số lượng của chuyển kho đã hoàn thành hoặc đã hủy'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        received_quantity = request.data.get('received_quantity', 0)
        
        if received_quantity > detail.quantity:
            return Response({
                'error': f'Số lượng nhận không được vượt quá số lượng chuyển ({detail.quantity})'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        detail.received_quantity = received_quantity
        detail.updated_by = request.user
        detail.save()
        
        serializer = self.get_serializer(detail)
        return Response({
            'message': 'Đã cập nhật số lượng nhận thành công',
            'detail': serializer.data
        }) 