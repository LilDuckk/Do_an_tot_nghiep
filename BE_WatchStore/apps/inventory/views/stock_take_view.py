from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.exceptions import ValidationError
from apps.inventory.models.stock_take import StockTake, StockTakeDetail
from apps.inventory.models.inventory import Inventory
from apps.inventory.models.inventory_transaction import InventoryTransaction
from apps.inventory.serializers.stock_take_serializer import StockTakeSerializer
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, AllowAny, OR
from django.utils import timezone

class StockTakeViewSet(viewsets.ModelViewSet):
    queryset = StockTake.objects.all()
    serializer_class = StockTakeSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['store', 'status', 'created_by']
    search_fields = ['notes', 'store__name']
    ordering_fields = ['start_date', 'end_date', 'created_at', 'status']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết kiểm kê
            return [IsStoreEmployee()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """Thống kê kiểm kê kho"""
        stock_take = self.get_object()
        details = stock_take.stocktakedetail_set.all()
        
        total_items = details.count()
        total_expected = details.aggregate(total=Sum('expected_quantity'))['total'] or 0
        total_actual = details.aggregate(total=Sum('actual_quantity'))['total'] or 0
        total_discrepancy = details.aggregate(total=Sum('discrepancy'))['total'] or 0
        
        summary_data = {
            'id': stock_take.id,
            'store': {
                'id': stock_take.store.id,
                'name': stock_take.store.name
            } if stock_take.store else None,
            'total_items': total_items,
            'total_expected': total_expected,
            'total_actual': total_actual,
            'total_discrepancy': total_discrepancy,
            'accuracy_rate': (total_actual / total_expected * 100) if total_expected > 0 else 0,
            'details': [
                {
                    'product_variant': {
                        'id': detail.product_variant.id,
                        'name': detail.product_variant.product.name if detail.product_variant.product else detail.product_variant.sku,
                        'sku': detail.product_variant.sku
                    },
                    'expected_quantity': detail.expected_quantity,
                    'actual_quantity': detail.actual_quantity,
                    'discrepancy': detail.discrepancy,
                    'notes': detail.notes
                }
                for detail in details
            ]
        }
        
        return Response(summary_data)

    @transaction.atomic
    @action(detail=True, methods=['post'])
    def complete_stock_take(self, request, pk=None):
        """Hoàn thành kiểm kê và tự động điều chỉnh inventory"""
        stock_take = self.get_object()
        
        if stock_take.status == 'completed':
            return Response(
                {'error': 'Kiểm kê đã hoàn thành'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if stock_take.status == 'cancelled':
            return Response(
                {'error': 'Không thể hoàn thành kiểm kê đã hủy'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # 1. Kiểm tra xem có chi tiết kiểm kê nào chưa
            details = stock_take.stocktakedetail_set.all()
            if not details.exists():
                return Response({
                    'error': 'Không có chi tiết kiểm kê nào để hoàn thành'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 2. Điều chỉnh inventory theo kết quả kiểm kê
            adjusted_items = []
            for detail in details:
                if detail.discrepancy != 0:  # Chỉ điều chỉnh khi có chênh lệch
                    inventory = Inventory.objects.filter(
                        store=stock_take.store,
                        product_variant=detail.product_variant
                    ).first()
                    
                    if inventory:
                        old_quantity = inventory.quantity
                        inventory.quantity = detail.actual_quantity
                        inventory.updated_by = request.user
                        inventory.save()
                        
                        # Tạo inventory transaction cho điều chỉnh
                        transaction_type = 'IN' if detail.discrepancy > 0 else 'OUT'
                        adjustment_quantity = abs(detail.discrepancy)
                        
                        InventoryTransaction.objects.create(
                            inventory=inventory,
                            transaction_type=transaction_type,
                            quantity=adjustment_quantity,
                            reference_type='stock_take',
                            reference_id=stock_take.id,
                            note=f"Điều chỉnh kiểm kê: {detail.notes or 'Chênh lệch kiểm kê'}",
                            created_by=request.user,
                            updated_by=request.user
                        )
                        
                        adjusted_items.append({
                            'product_name': detail.product_variant.product.name if detail.product_variant.product else detail.product_variant.sku,
                            'old_quantity': old_quantity,
                            'new_quantity': detail.actual_quantity,
                            'adjustment': detail.discrepancy,
                            'transaction_type': transaction_type
                        })
            
            # 3. Cập nhật trạng thái kiểm kê
            stock_take.status = 'completed'
            stock_take.end_date = timezone.now()
            stock_take.updated_by = request.user
            stock_take.save()
            
            return Response({
                'message': f'Đã hoàn thành kiểm kê #{stock_take.id} và điều chỉnh tồn kho',
                'stock_take': StockTakeSerializer(stock_take).data,
                'adjusted_items': adjusted_items,
                'total_adjustments': len(adjusted_items)
            })
            
        except Exception as e:
            transaction.set_rollback(True)
            return Response({
                'error': f'Lỗi khi hoàn thành kiểm kê: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @transaction.atomic
    @action(detail=True, methods=['post'])
    def cancel_stock_take(self, request, pk=None):
        """Hủy kiểm kê và hoàn trả inventory nếu đã hoàn thành"""
        stock_take = self.get_object()
        
        if stock_take.status == 'cancelled':
            return Response(
                {'error': 'Kiểm kê đã được hủy trước đó'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Nếu đã hoàn thành, hoàn trả inventory về trạng thái ban đầu
            if stock_take.status == 'completed':
                # Lưu lại thông tin điều chỉnh để hoàn trả
                for detail in stock_take.stocktakedetail_set.all():
                    if detail.discrepancy != 0:
                        inventory = Inventory.objects.filter(
                            store=stock_take.store,
                            product_variant=detail.product_variant
                        ).first()
                        
                        if inventory:
                            # Hoàn trả về số lượng ban đầu
                            inventory.quantity = detail.expected_quantity
                            inventory.updated_by = request.user
                            inventory.save()
                            
                            # Tạo transaction hoàn trả
                            transaction_type = 'OUT' if detail.discrepancy > 0 else 'IN'
                            adjustment_quantity = abs(detail.discrepancy)
                            
                            InventoryTransaction.objects.create(
                                inventory=inventory,
                                transaction_type=transaction_type,
                                quantity=adjustment_quantity,
                                reference_type='stock_take_cancel',
                                reference_id=stock_take.id,
                                note=f"Hủy kiểm kê - hoàn trả về số lượng ban đầu",
                                created_by=request.user,
                                updated_by=request.user
                            )
            
            # Cập nhật trạng thái
            stock_take.status = 'cancelled'
            stock_take.updated_by = request.user
            stock_take.save()
            
            return Response({
                'message': f'Đã hủy kiểm kê #{stock_take.id}',
                'stock_take': StockTakeSerializer(stock_take).data
            })
            
        except Exception as e:
            transaction.set_rollback(True)
            return Response({
                'error': f'Lỗi khi hủy kiểm kê: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def update_stock_take_details(self, request, pk=None):
        """Cập nhật chi tiết kiểm kê"""
        stock_take = self.get_object()
        
        if stock_take.status == 'completed':
            return Response(
                {'error': 'Không thể cập nhật chi tiết kiểm kê đã hoàn thành'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        details_data = request.data.get('details', [])
        updated_details = []
        
        try:
            for item in details_data:
                detail_id = item.get('detail_id')
                actual_quantity = item.get('actual_quantity', 0)
                notes = item.get('notes', '')
                
                detail = StockTakeDetail.objects.get(
                    id=detail_id,
                    stock_take=stock_take
                )
                
                detail.actual_quantity = actual_quantity
                detail.discrepancy = actual_quantity - detail.expected_quantity
                detail.notes = notes
                detail.updated_by = request.user
                detail.save()
                
                updated_details.append({
                    'detail_id': detail_id,
                    'product_name': detail.product_variant.product.name if detail.product_variant.product else detail.product_variant.sku,
                    'expected_quantity': detail.expected_quantity,
                    'actual_quantity': actual_quantity,
                    'discrepancy': detail.discrepancy,
                    'notes': notes
                })
            
            return Response({
                'message': 'Đã cập nhật chi tiết kiểm kê thành công',
                'updated_details': updated_details
            })
            
        except StockTakeDetail.DoesNotExist:
            return Response({
                'error': 'Không tìm thấy chi tiết kiểm kê'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'Lỗi khi cập nhật chi tiết: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Thống kê tổng quan kiểm kê kho"""
        queryset = self.get_queryset()
        
        # Thống kê theo trạng thái
        status_stats = queryset.values('status').annotate(
            count=Count('id')
        )
        
        # Thống kê theo cửa hàng
        store_stats = queryset.values('store__name').annotate(
            count=Count('id')
        ).filter(store__isnull=False)
        
        # Thống kê chênh lệch tổng
        total_discrepancy = StockTakeDetail.objects.filter(
            stock_take__in=queryset
        ).aggregate(total=Sum('discrepancy'))['total'] or 0
        
        # Thống kê độ chính xác
        total_expected = StockTakeDetail.objects.filter(
            stock_take__in=queryset
        ).aggregate(total=Sum('expected_quantity'))['total'] or 0
        
        total_actual = StockTakeDetail.objects.filter(
            stock_take__in=queryset
        ).aggregate(total=Sum('actual_quantity'))['total'] or 0
        
        accuracy_rate = (total_actual / total_expected * 100) if total_expected > 0 else 0
        
        statistics_data = {
            'total_stock_takes': queryset.count(),
            'total_items_checked': StockTakeDetail.objects.filter(
                stock_take__in=queryset
            ).count(),
            'total_discrepancy': total_discrepancy,
            'accuracy_rate': accuracy_rate,
            'status_statistics': status_stats,
            'store_statistics': store_stats
        }
        
        return Response(statistics_data) 