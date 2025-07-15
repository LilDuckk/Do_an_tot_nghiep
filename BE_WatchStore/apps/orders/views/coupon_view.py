from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.orders.models.coupon import Coupon
from apps.orders.serializers.coupon_serializer import CouponSerializer, CouponCreateSerializer
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, AllowAny, OR
from apps.core.mixins import SoftDeleteMixin

class CouponViewSet(SoftDeleteMixin, viewsets.ModelViewSet):
    queryset = Coupon.objects.all()  # Sử dụng custom manager, không cần filter
    serializer_class = CouponSerializer
    filterset_fields = ['code', 'discount_type', 'is_active']
    search_fields = ['code']
    ordering_fields = ['code', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Sử dụng serializer khác nhau cho create và các action khác"""
        if self.action == 'create':
            return CouponCreateSerializer
        return CouponSerializer

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết mã giảm giá
            return [AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        """Tạo coupon mới với validation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Sử dụng custom manager để tạo hoặc khôi phục coupon
        validated_data = serializer.validated_data.copy()
        validated_data['created_by'] = request.user
        validated_data['updated_by'] = request.user
        
        try:
            # Kiểm tra xem có coupon cũ với cùng code đã bị xóa mềm không
            code = validated_data.get('code')
            existing_deleted = None
            if code:
                existing_deleted = Coupon.objects.filter(
                    code=code,
                    is_deleted=True
                ).first()
            
            coupon = Coupon.objects.create_or_restore(**validated_data)
            
            # Nếu có coupon cũ đã bị xóa mềm, thì đây là khôi phục
            if existing_deleted:
                response_serializer = CouponSerializer(coupon)
                return Response({
                    'message': f'Đã khôi phục và cập nhật coupon {coupon.code}',
                    'coupon': response_serializer.data
                }, status=status.HTTP_200_OK)
            else:
                response_serializer = CouponSerializer(coupon)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def update(self, request, *args, **kwargs):
        """Cập nhật coupon với validation"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Tự động set updated_by
        coupon = serializer.save(updated_by=request.user)
        
        response_serializer = self.get_serializer(coupon)
        return Response(response_serializer.data)

    @action(detail=True, methods=['post'])
    def validate(self, request, pk=None):
        """Kiểm tra coupon có hợp lệ không"""
        try:
            coupon = self.get_object()
            order_amount = request.data.get('order_amount')
            
            can_use, message = coupon.can_use(order_amount)
            
            if can_use:
                discount_amount = coupon.get_discount_amount(order_amount or 0)
                return Response({
                    'valid': True,
                    'message': message,
                    'discount_amount': float(discount_amount),
                    'remaining_usage': coupon.get_remaining_usage()
                })
            else:
                return Response({
                    'valid': False,
                    'message': message
                })
                
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def sync_usage(self, request, pk=None):
        """Đồng bộ usage_count từ database"""
        try:
            coupon = self.get_object()
            old_usage_count = coupon.usage_count
            new_usage_count = coupon.sync_usage_count()
            
            return Response({
                'message': f'Đã đồng bộ usage_count cho coupon {coupon.code}',
                'old_usage_count': old_usage_count,
                'new_usage_count': new_usage_count,
                'remaining_usage': coupon.get_remaining_usage()
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def sync_all_usage(self, request):
        """Đồng bộ usage_count cho tất cả coupons"""
        try:
            coupons = self.get_queryset()
            synced_count = 0
            
            for coupon in coupons:
                old_count = coupon.usage_count
                new_count = coupon.sync_usage_count()
                if old_count != new_count:
                    synced_count += 1
            
            return Response({
                'message': f'Đã đồng bộ usage_count cho {synced_count} coupons',
                'synced_count': synced_count
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def usage_details(self, request, pk=None):
        """Lấy chi tiết sử dụng coupon"""
        try:
            coupon = self.get_object()
            
            # Lấy danh sách orders đã sử dụng coupon
            from apps.orders.models.order_detail import OrderDetail
            order_details = OrderDetail.objects.filter(
                coupon=coupon,
                order__status__in=['completed', 'delivered']
            ).select_related('order', 'product_variant__product')
            
            usage_details = []
            for detail in order_details:
                usage_details.append({
                    'order_id': detail.order.id,
                    'order_number': detail.order.order_number,
                    'order_date': detail.order.order_date,
                    'product_name': detail.product_variant.product.name,
                    'quantity': detail.quantity,
                    'discount_amount': float(detail.discount),
                    'final_price': float(detail.final_price)
                })
            
            return Response({
                'coupon_code': coupon.code,
                'usage_count': coupon.usage_count,
                'usage_limit': coupon.usage_limit,
                'remaining_usage': coupon.get_remaining_usage(),
                'is_valid': coupon.is_valid(),
                'usage_details': usage_details
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def fix_cancelled_orders(self, request, pk=None):
        """Sửa lại usage_count cho các order đã bị hủy"""
        try:
            coupon = self.get_object()
            
            # Lấy tất cả order details sử dụng coupon này
            from apps.orders.models.order_detail import OrderDetail
            order_details = OrderDetail.objects.filter(
                coupon=coupon
            ).select_related('order')
            
            # Tính toán usage_count thực tế từ database
            actual_usage_count = 0
            cancelled_orders = []
            
            for detail in order_details:
                if detail.order.status in ['completed', 'delivered']:
                    actual_usage_count += 1
                elif detail.order.status == 'cancelled':
                    cancelled_orders.append({
                        'order_id': detail.order.id,
                        'order_number': detail.order.order_number,
                        'order_date': detail.order.order_date
                    })
            
            # Cập nhật usage_count
            old_usage_count = coupon.usage_count
            coupon.usage_count = actual_usage_count
            coupon.save(update_fields=['usage_count'])
            
            return Response({
                'message': f'Đã sửa usage_count cho coupon {coupon.code}',
                'old_usage_count': old_usage_count,
                'new_usage_count': actual_usage_count,
                'cancelled_orders_count': len(cancelled_orders),
                'cancelled_orders': cancelled_orders,
                'remaining_usage': coupon.get_remaining_usage()
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def fix_all_cancelled_orders(self, request):
        """Sửa lại usage_count cho tất cả coupons có order bị hủy"""
        try:
            coupons = self.get_queryset()
            fixed_count = 0
            total_fixed_usage = 0
            
            for coupon in coupons:
                # Lấy tất cả order details sử dụng coupon này
                from apps.orders.models.order_detail import OrderDetail
                order_details = OrderDetail.objects.filter(coupon=coupon)
                
                # Tính toán usage_count thực tế
                actual_usage_count = 0
                for detail in order_details:
                    if detail.order.status in ['completed', 'delivered']:
                        actual_usage_count += 1
                
                # Cập nhật nếu khác biệt
                if coupon.usage_count != actual_usage_count:
                    old_count = coupon.usage_count
                    coupon.usage_count = actual_usage_count
                    coupon.save(update_fields=['usage_count'])
                    fixed_count += 1
                    total_fixed_usage += (old_count - actual_usage_count)
            
            return Response({
                'message': f'Đã sửa usage_count cho {fixed_count} coupons',
                'fixed_count': fixed_count,
                'total_fixed_usage': total_fixed_usage
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def deleted_coupons(self, request):
        """Lấy danh sách coupon đã bị xóa mềm"""
        try:
            # Sử dụng model manager gốc để lấy tất cả coupon (bao gồm đã bị xóa)
            deleted_coupons = Coupon._base_manager.filter(is_deleted=True)
            serializer = self.get_serializer(deleted_coupons, many=True)
            
            return Response({
                'deleted_coupons': serializer.data,
                'total_deleted': deleted_coupons.count()
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """Khôi phục coupon đã bị xóa mềm"""
        try:
            coupon = self.get_object()
            
            if not coupon.is_deleted:
                return Response({
                    'error': 'Coupon này chưa bị xóa'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Kiểm tra xem có coupon khác với cùng code đang hoạt động không
            existing_active = Coupon.objects.filter(
                code=coupon.code,
                is_deleted=False
            ).exclude(pk=coupon.pk).first()
            
            if existing_active:
                return Response({
                    'error': f'Đã có coupon khác với code "{coupon.code}" đang hoạt động'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Khôi phục coupon
            coupon.is_deleted = False
            coupon.usage_count = 0  # Reset usage_count
            coupon.updated_by = request.user
            coupon.save()
            
            serializer = self.get_serializer(coupon)
            return Response({
                'message': f'Đã khôi phục coupon {coupon.code}',
                'coupon': serializer.data
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 