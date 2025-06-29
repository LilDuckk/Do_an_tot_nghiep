from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.db import transaction
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.exceptions import ValidationError
from apps.inventory.models.stock_transfer import StockTransfer, StockTransferDetail
from apps.inventory.models.inventory import Inventory
from apps.inventory.models.inventory_transaction import InventoryTransaction
from apps.inventory.serializers.stock_transfer_serializer import (
    StockTransferSerializer, StockTransferListSerializer, StockTransferDetailSerializer
)
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, AllowAny, OR

class StockTransferViewSet(viewsets.ModelViewSet):
    queryset = StockTransfer.objects.all()
    serializer_class = StockTransferSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['source_store', 'destination_store', 'status', 'created_by']
    search_fields = ['note', 'source_store__name', 'destination_store__name']
    ordering_fields = ['transfer_date', 'created_at', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return StockTransferListSerializer
        return StockTransferSerializer

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết chuyển kho
            return [IsStoreEmployee()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """Thống kê chuyển kho"""
        stock_transfer = self.get_object()
        details = stock_transfer.stocktransferdetail_set.all()
        
        total_items = details.count()
        total_quantity = details.aggregate(total=Sum('quantity'))['total'] or 0
        total_received = details.aggregate(total=Sum('received_quantity'))['total'] or 0
        
        summary_data = {
            'id': stock_transfer.id,
            'source_store': {
                'id': stock_transfer.source_store.id,
                'name': stock_transfer.source_store.name
            } if stock_transfer.source_store else None,
            'destination_store': {
                'id': stock_transfer.destination_store.id,
                'name': stock_transfer.destination_store.name
            } if stock_transfer.destination_store else None,
            'total_items': total_items,
            'total_quantity': total_quantity,
            'total_received': total_received,
            'completion_rate': (total_received / total_quantity * 100) if total_quantity > 0 else 0,
            'details': StockTransferDetailSerializer(details, many=True).data
        }
        
        return Response(summary_data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Thống kê tổng quan chuyển kho"""
        queryset = self.get_queryset()
        
        # Thống kê theo trạng thái
        status_stats = queryset.values('status').annotate(
            count=Count('id'),
            total_quantity=Sum('stocktransferdetail__quantity'),
            total_received=Sum('stocktransferdetail__received_quantity')
        )
        
        # Thống kê theo cửa hàng nguồn
        source_store_stats = queryset.values('source_store__name').annotate(
            count=Count('id')
        ).filter(source_store__isnull=False)
        
        # Thống kê theo cửa hàng đích
        destination_store_stats = queryset.values('destination_store__name').annotate(
            count=Count('id')
        ).filter(destination_store__isnull=False)
        
        total_transfers = queryset.count()
        total_items = StockTransferDetail.objects.filter(
            stock_transfer__in=queryset
        ).count()
        
        statistics_data = {
            'total_transfers': total_transfers,
            'total_items': total_items,
            'status_statistics': status_stats,
            'source_store_statistics': source_store_stats,
            'destination_store_statistics': destination_store_stats
        }
        
        return Response(statistics_data)

    @transaction.atomic
    @action(detail=True, methods=['post'])
    def confirm_transfer(self, request, pk=None):
        """Xác nhận chuyển kho và tự động cập nhật inventory"""
        stock_transfer = self.get_object()
        
        if stock_transfer.status == 'completed':
            return Response(
                {'error': 'Chuyển kho đã hoàn thành'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if stock_transfer.status == 'cancelled':
            return Response(
                {'error': 'Không thể xác nhận chuyển kho đã hủy'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # 1. Kiểm tra tồn kho nguồn
            insufficient_items = []
            for detail in stock_transfer.stocktransferdetail_set.all():
                source_inventory = Inventory.objects.filter(
                    store=stock_transfer.source_store,
                    product_variant=detail.product_variant
                ).first()
                
                if not source_inventory or source_inventory.quantity < detail.quantity:
                    insufficient_items.append({
                        'product': detail.product_variant.product.name if detail.product_variant.product else detail.product_variant.sku,
                        'required': detail.quantity,
                        'available': source_inventory.quantity if source_inventory else 0
                    })
            
            if insufficient_items:
                return Response({
                    'error': 'Không đủ tồn kho để chuyển',
                    'insufficient_items': insufficient_items
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 2. Trừ tồn kho nguồn và tạo transaction OUT
            for detail in stock_transfer.stocktransferdetail_set.all():
                source_inventory = Inventory.objects.get(
                    store=stock_transfer.source_store,
                    product_variant=detail.product_variant
                )
                source_inventory.quantity -= detail.quantity
                source_inventory.updated_by = request.user
                source_inventory.save()
                
                # Tạo inventory transaction OUT
                InventoryTransaction.objects.create(
                    inventory=source_inventory,
                    transaction_type='OUT',
                    quantity=detail.quantity,
                    reference_type='stock_transfer',
                    reference_id=stock_transfer.id,
                    note=f"Chuyển kho đến {stock_transfer.destination_store.name} - {detail.product_variant.product.name if detail.product_variant.product else detail.product_variant.sku}",
                    created_by=request.user,
                    updated_by=request.user
                )
            
            # 3. Cộng tồn kho đích và tạo transaction IN
            for detail in stock_transfer.stocktransferdetail_set.all():
                dest_inventory, created = Inventory.objects.get_or_create(
                    store=stock_transfer.destination_store,
                    product_variant=detail.product_variant,
                    defaults={
                        'quantity': 0,
                        'created_by': request.user,
                        'updated_by': request.user
                    }
                )
                
                received_qty = detail.received_quantity or detail.quantity
                dest_inventory.quantity += received_qty
                dest_inventory.updated_by = request.user
                dest_inventory.save()
                
                # Tạo inventory transaction IN
                InventoryTransaction.objects.create(
                    inventory=dest_inventory,
                    transaction_type='IN',
                    quantity=received_qty,
                    reference_type='stock_transfer',
                    reference_id=stock_transfer.id,
                    note=f"Chuyển kho từ {stock_transfer.source_store.name} - {detail.product_variant.product.name if detail.product_variant.product else detail.product_variant.sku}",
                    created_by=request.user,
                    updated_by=request.user
                )
                
                # Cập nhật received_quantity nếu chưa có
                if not detail.received_quantity:
                    detail.received_quantity = detail.quantity
                    detail.updated_by = request.user
                    detail.save()
            
            # 4. Cập nhật trạng thái chuyển kho
            stock_transfer.status = 'completed'
            stock_transfer.updated_by = request.user
            stock_transfer.save()
            
            return Response({
                'message': f'Đã xác nhận chuyển kho #{stock_transfer.id} và cập nhật tồn kho thành công',
                'stock_transfer': StockTransferSerializer(stock_transfer).data,
                'updated_items': [
                    {
                        'product_name': detail.product_variant.product.name if detail.product_variant.product else detail.product_variant.sku,
                        'quantity_transferred': detail.quantity,
                        'source_store': stock_transfer.source_store.name,
                        'destination_store': stock_transfer.destination_store.name
                    }
                    for detail in stock_transfer.stocktransferdetail_set.all()
                ]
            })
            
        except Exception as e:
            transaction.set_rollback(True)
            return Response({
                'error': f'Lỗi khi xác nhận chuyển kho: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @transaction.atomic
    @action(detail=True, methods=['post'])
    def cancel_transfer(self, request, pk=None):
        """Hủy chuyển kho và hoàn trả inventory nếu đã xác nhận"""
        stock_transfer = self.get_object()
        
        if stock_transfer.status == 'completed':
            return Response(
                {'error': 'Không thể hủy chuyển kho đã hoàn thành'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if stock_transfer.status == 'cancelled':
            return Response(
                {'error': 'Chuyển kho đã được hủy trước đó'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Nếu đã xác nhận một phần (in_transit), hoàn trả inventory
            if stock_transfer.status == 'in_transit':
                # Hoàn trả tồn kho nguồn
                for detail in stock_transfer.stocktransferdetail_set.all():
                    if detail.received_quantity and detail.received_quantity > 0:
                        # Trừ lại tồn kho đích
                        dest_inventory = Inventory.objects.filter(
                            store=stock_transfer.destination_store,
                            product_variant=detail.product_variant
                        ).first()
                        
                        if dest_inventory:
                            dest_inventory.quantity -= detail.received_quantity
                            dest_inventory.updated_by = request.user
                            dest_inventory.save()
                            
                            # Tạo transaction hoàn trả
                            InventoryTransaction.objects.create(
                                inventory=dest_inventory,
                                transaction_type='OUT',
                                quantity=detail.received_quantity,
                                reference_type='stock_transfer_cancel',
                                reference_id=stock_transfer.id,
                                note=f"Hủy chuyển kho - hoàn trả về {stock_transfer.source_store.name}",
                                created_by=request.user,
                                updated_by=request.user
                            )
                        
                        # Cộng lại tồn kho nguồn
                        source_inventory = Inventory.objects.filter(
                            store=stock_transfer.source_store,
                            product_variant=detail.product_variant
                        ).first()
                        
                        if source_inventory:
                            source_inventory.quantity += detail.received_quantity
                            source_inventory.updated_by = request.user
                            source_inventory.save()
                            
                            # Tạo transaction hoàn trả
                            InventoryTransaction.objects.create(
                                inventory=source_inventory,
                                transaction_type='IN',
                                quantity=detail.received_quantity,
                                reference_type='stock_transfer_cancel',
                                reference_id=stock_transfer.id,
                                note=f"Hủy chuyển kho - hoàn trả từ {stock_transfer.destination_store.name}",
                                created_by=request.user,
                                updated_by=request.user
                            )
            
            # Cập nhật trạng thái
            stock_transfer.status = 'cancelled'
            stock_transfer.updated_by = request.user
            stock_transfer.save()
            
            return Response({
                'message': f'Đã hủy chuyển kho #{stock_transfer.id}',
                'stock_transfer': StockTransferSerializer(stock_transfer).data
            })
            
        except Exception as e:
            transaction.set_rollback(True)
            return Response({
                'error': f'Lỗi khi hủy chuyển kho: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def start_transfer(self, request, pk=None):
        """Bắt đầu chuyển kho (chuyển sang trạng thái in_transit)"""
        stock_transfer = self.get_object()
        
        if stock_transfer.status != 'pending':
            return Response(
                {'error': 'Chỉ có thể bắt đầu chuyển kho ở trạng thái pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        stock_transfer.status = 'in_transit'
        stock_transfer.updated_by = request.user
        stock_transfer.save()
        
        return Response({
            'message': f'Đã bắt đầu chuyển kho #{stock_transfer.id}',
            'stock_transfer': StockTransferSerializer(stock_transfer).data
        })

    @action(detail=True, methods=['post'])
    def update_received_quantities(self, request, pk=None):
        """Cập nhật số lượng đã nhận cho từng sản phẩm"""
        stock_transfer = self.get_object()
        
        if stock_transfer.status not in ['in_transit', 'pending']:
            return Response(
                {'error': 'Chỉ có thể cập nhật số lượng khi chuyển kho chưa hoàn thành'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        received_data = request.data.get('received_quantities', [])
        updated_details = []
        
        try:
            for item in received_data:
                detail_id = item.get('detail_id')
                received_quantity = item.get('received_quantity', 0)
                
                detail = StockTransferDetail.objects.get(
                    id=detail_id,
                    stock_transfer=stock_transfer
                )
                
                if received_quantity > detail.quantity:
                    product_name = detail.product_variant.product.name if detail.product_variant.product else detail.product_variant.sku
                    return Response({
                        'error': f'Số lượng nhận không được vượt quá số lượng chuyển cho {product_name}'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                detail.received_quantity = received_quantity
                detail.updated_by = request.user
                detail.save()
                
                updated_details.append({
                    'detail_id': detail_id,
                    'product_name': detail.product_variant.product.name if detail.product_variant.product else detail.product_variant.sku,
                    'quantity': detail.quantity,
                    'received_quantity': received_quantity
                })
            
            return Response({
                'message': 'Đã cập nhật số lượng nhận thành công',
                'updated_details': updated_details
            })
            
        except StockTransferDetail.DoesNotExist:
            return Response({
                'error': 'Không tìm thấy chi tiết chuyển kho'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'Lỗi khi cập nhật số lượng: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 