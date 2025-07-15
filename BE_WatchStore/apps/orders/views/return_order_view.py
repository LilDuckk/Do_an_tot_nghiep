from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from apps.orders.models.return_order import ReturnOrder
from apps.orders.serializers.return_order_serializer import ReturnOrderSerializer, ReturnOrderCreateSerializer
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

    def get_serializer_class(self):
        """Sử dụng serializer khác nhau cho create và update"""
        if self.action == 'create':
            return ReturnOrderCreateSerializer
        return ReturnOrderSerializer

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

    def create(self, request, *args, **kwargs):
        """Tạo đơn trả hàng mới với return_number tự động"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            # Tạo return order với thông tin người tạo
            return_order = serializer.save(
                created_by=request.user,
                updated_by=request.user
            )
            
            # Đảm bảo return_number được tạo
            if not return_order.return_number:
                return_order.return_number = return_order.generate_return_number()
                return_order.save(update_fields=['return_number'])
            
            # Tự động tính toán refund_amount nếu có return order details
            if return_order.returnorderdetail_set.exists():
                return_order.update_refund_amount()
            
            # Serialize lại với đầy đủ thông tin
            response_serializer = ReturnOrderSerializer(return_order)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Duyệt đơn trả hàng"""
        try:
            return_order = self.get_object()
            
            # Tính toán refund_amount trước khi duyệt
            refund_amount = return_order.calculate_refund_amount()
            
            # Xử lý approve thông qua service
            ReturnOrderService.process_return_order(
                return_order, 
                'approve', 
                user=request.user
            )
            
            # Cập nhật refund_amount nếu chưa được cập nhật
            if not return_order.refund_amount:
                return_order.refund_amount = refund_amount
                return_order.save(update_fields=['refund_amount'])
            
            serializer = self.get_serializer(return_order)
            return Response({
                'message': f'Đã duyệt đơn trả hàng {return_order.return_number}',
                'return_order': serializer.data,
                'refund_amount': float(refund_amount)
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

    @action(detail=True, methods=['post'])
    def calculate_refund(self, request, pk=None):
        """Tính toán refund_amount dựa trên return order details"""
        try:
            return_order = self.get_object()
            
            # Tính toán refund_amount
            refund_amount = return_order.calculate_refund_amount()
            
            # Cập nhật refund_amount
            return_order.refund_amount = refund_amount
            return_order.updated_by = request.user
            return_order.save(update_fields=['refund_amount', 'updated_by'])
            
            # Lấy chi tiết tính toán
            refund_details = []
            for return_detail in return_order.returnorderdetail_set.all():
                detail_info = {
                    'return_detail_id': return_detail.id,
                    'product_variant_id': return_detail.product_variant.id if return_detail.product_variant else None,
                    'product_name': return_detail.product_variant.product.name if return_detail.product_variant else None,
                    'quantity': return_detail.quantity,
                    'unit_price': None,
                    'refund_amount': 0
                }
                
                if return_detail.product_variant:
                    variant_price = return_detail.product_variant.get_final_price()
                    detail_info['unit_price'] = float(variant_price)
                    detail_info['refund_amount'] = float(variant_price * return_detail.quantity)
                elif return_detail.order_detail:
                    order_detail = return_detail.order_detail
                    original_quantity = order_detail.quantity
                    return_quantity = return_detail.quantity
                    
                    if original_quantity > 0:
                        return_ratio = return_quantity / original_quantity
                        detail_info['unit_price'] = float(order_detail.final_price / original_quantity)
                        detail_info['refund_amount'] = float(order_detail.final_price * return_ratio)
                
                refund_details.append(detail_info)
            
            serializer = self.get_serializer(return_order)
            return Response({
                'message': f'Đã tính toán refund_amount cho đơn trả hàng {return_order.return_number}',
                'return_order': serializer.data,
                'refund_amount': float(refund_amount),
                'refund_details': refund_details
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def refund_breakdown(self, request, pk=None):
        """Lấy chi tiết tính toán refund_amount"""
        try:
            return_order = self.get_object()
            
            # Tính toán refund_amount
            refund_amount = return_order.calculate_refund_amount()
            
            # Lấy chi tiết tính toán
            refund_details = []
            for return_detail in return_order.returnorderdetail_set.all():
                detail_info = {
                    'return_detail_id': return_detail.id,
                    'product_variant_id': return_detail.product_variant.id if return_detail.product_variant else None,
                    'product_name': return_detail.product_variant.product.name if return_detail.product_variant else None,
                    'sku': return_detail.product_variant.sku if return_detail.product_variant else None,
                    'quantity': return_detail.quantity,
                    'unit_price': None,
                    'refund_amount': 0,
                    'calculation_method': None
                }
                
                if return_detail.product_variant:
                    variant_price = return_detail.product_variant.get_final_price()
                    detail_info['unit_price'] = float(variant_price)
                    detail_info['refund_amount'] = float(variant_price * return_detail.quantity)
                    detail_info['calculation_method'] = 'product_variant_price'
                elif return_detail.order_detail:
                    order_detail = return_detail.order_detail
                    original_quantity = order_detail.quantity
                    return_quantity = return_detail.quantity
                    
                    if original_quantity > 0:
                        return_ratio = return_quantity / original_quantity
                        detail_info['unit_price'] = float(order_detail.final_price / original_quantity)
                        detail_info['refund_amount'] = float(order_detail.final_price * return_ratio)
                        detail_info['calculation_method'] = 'order_detail_ratio'
                
                refund_details.append(detail_info)
            
            return Response({
                'return_order_id': return_order.id,
                'return_number': return_order.return_number,
                'total_refund_amount': float(refund_amount),
                'refund_details': refund_details
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def update_all_refunds(self, request):
        """Cập nhật refund_amount cho tất cả return orders"""
        try:
            queryset = self.get_queryset()
            updated_count = 0
            total_amount = 0
            
            for return_order in queryset:
                if return_order.returnorderdetail_set.exists():
                    old_amount = return_order.refund_amount or 0
                    new_amount = return_order.update_refund_amount()
                    if old_amount != new_amount:
                        updated_count += 1
                        total_amount += float(new_amount)
            
            return Response({
                'message': f'Đã cập nhật refund_amount cho {updated_count} return orders',
                'updated_count': updated_count,
                'total_refund_amount': total_amount
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 