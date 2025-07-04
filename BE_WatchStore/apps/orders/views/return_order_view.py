from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from apps.orders.models.return_order import ReturnOrder
from apps.orders.serializers.return_order_serializer import ReturnOrderSerializer
from apps.orders.services import ReturnOrderService
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, AllowAny, OR
from apps.core.mixins import SoftDeleteMixin

class ReturnOrderViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    queryset = ReturnOrder.objects.filter(is_deleted=False).select_related(
        'order__customer',
        'order__store',
        'approved_by',
        'created_by',
        'updated_by'
    ).prefetch_related('returnorderdetail_set__order_detail__product_variant__product')
    serializer_class = ReturnOrderSerializer
    filterset_fields = ['order', 'status', 'refund_status']
    search_fields = ['return_number', 'reason']
    ordering_fields = ['return_number', 'return_date', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết đơn trả hàng
            return [AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    def get_queryset(self):
        """Filter queryset theo store nếu user không phải superuser"""
        queryset = super().get_queryset()
        
        # Nếu user không phải superuser, chỉ hiển thị return order của store của họ
        if not self.request.user.is_superuser:
            if hasattr(self.request.user, 'employee'):
                store_id = self.request.user.employee.store.id
                queryset = queryset.filter(order__store_id=store_id)
        
        return queryset

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Duyệt đơn trả hàng"""
        try:
            return_order = self.get_object()
            
            # Xử lý approve thông qua service
            ReturnOrderService.process_return_order(
                return_order, 
                'approve', 
                user=request.user
            )
            
            serializer = self.get_serializer(return_order)
            return Response({
                'message': f'Đã duyệt đơn trả hàng {return_order.return_number}',
                'return_order': serializer.data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Từ chối đơn trả hàng"""
        try:
            return_order = self.get_object()
            rejection_reason = request.data.get('rejection_reason', '')
            
            if not rejection_reason:
                return Response(
                    {'error': 'Rejection reason is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Xử lý reject thông qua service
            ReturnOrderService.process_return_order(
                return_order, 
                'reject', 
                user=request.user,
                rejection_reason=rejection_reason
            )
            
            serializer = self.get_serializer(return_order)
            return Response({
                'message': f'Đã từ chối đơn trả hàng {return_order.return_number}',
                'return_order': serializer.data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Hoàn thành đơn trả hàng"""
        try:
            return_order = self.get_object()
            
            # Xử lý complete thông qua service
            ReturnOrderService.process_return_order(
                return_order, 
                'complete', 
                user=request.user
            )
            
            serializer = self.get_serializer(return_order)
            return Response({
                'message': f'Đã hoàn thành đơn trả hàng {return_order.return_number}',
                'return_order': serializer.data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def order_details(self, request, pk=None):
        """Lấy danh sách order details có thể trả hàng"""
        try:
            return_order = self.get_object()
            order = return_order.order
            
            if not order:
                return Response(
                    {'error': 'Return order not linked to any order'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Lấy tất cả order details của order gốc
            from apps.orders.models.order_detail import OrderDetail
            from apps.orders.serializers.order_detail_serializer import OrderDetailSerializer
            
            order_details = OrderDetail.objects.filter(
                order=order,
                is_deleted=False
            ).select_related('product_variant__product')
            
            # Thêm thông tin về số lượng đã trả (nếu có)
            for detail in order_details:
                returned_quantity = 0
                for return_detail in return_order.returnorderdetail_set.all():
                    if return_detail.order_detail == detail:
                        returned_quantity += return_detail.quantity
                
                detail.returned_quantity = returned_quantity
                detail.available_for_return = detail.quantity - returned_quantity
            
            serializer = OrderDetailSerializer(order_details, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Lấy thống kê return orders"""
        try:
            stats = ReturnOrderService.get_return_statistics()
            return Response(stats)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            ) 