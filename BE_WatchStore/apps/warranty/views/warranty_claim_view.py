from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.core.exceptions import ValidationError
from apps.warranty.models.warranty_claim import WarrantyClaim
from apps.warranty.serializers.warranty_claim_serializer import WarrantyClaimSerializer
from apps.warranty.services import WarrantyService
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, AllowAny, OR

class WarrantyClaimViewSet(viewsets.ModelViewSet):
    queryset = WarrantyClaim.objects.all()
    serializer_class = WarrantyClaimSerializer
    filterset_fields = ['warranty', 'status']
    search_fields = ['claim_number']
    ordering_fields = ['claim_number', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết yêu cầu bảo hành
            return [IsStoreEmployee()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Lấy thống kê warranty claims"""
        try:
            from django.db.models import Count
            
            total_claims = self.get_queryset().count()
            pending_claims = self.get_queryset().filter(status='PENDING').count()
            in_progress_claims = self.get_queryset().filter(status='IN_PROGRESS').count()
            completed_claims = self.get_queryset().filter(status='COMPLETED').count()
            rejected_claims = self.get_queryset().filter(status='REJECTED').count()
            
            stats = {
                'total_claims': total_claims,
                'pending_claims': pending_claims,
                'in_progress_claims': in_progress_claims,
                'completed_claims': completed_claims,
                'rejected_claims': rejected_claims,
            }
            
            return Response(stats)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def pending_claims(self, request):
        """Lấy danh sách claims đang chờ xử lý"""
        try:
            claims = self.get_queryset().filter(status='PENDING')
            serializer = self.get_serializer(claims, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def overdue_claims(self, request):
        """Lấy danh sách claims quá hạn"""
        try:
            overdue_claims = []
            for claim in self.get_queryset().filter(status__in=['PENDING', 'IN_PROGRESS']):
                if claim.is_overdue():
                    overdue_claims.append(claim)
            
            serializer = self.get_serializer(overdue_claims, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def approve_claim(self, request, pk=None):
        """Duyệt warranty claim"""
        try:
            claim = self.get_object()
            
            if not claim.can_be_processed():
                return Response(
                    {'error': 'Claim cannot be processed in current status'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Xử lý claim
            WarrantyService.process_warranty_claim(
                warranty_claim=claim,
                action='approve',
                user=request.user
            )
            
            serializer = self.get_serializer(claim)
            return Response(serializer.data)
            
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def complete_claim(self, request, pk=None):
        """Hoàn thành warranty claim"""
        try:
            claim = self.get_object()
            resolution = request.data.get('resolution', '')
            repair_cost = request.data.get('repair_cost', 0)
            
            if not claim.can_be_completed():
                return Response(
                    {'error': 'Claim cannot be completed in current status'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Cập nhật thông tin
            claim.resolution = resolution
            claim.repair_cost = repair_cost
            
            # Xử lý claim
            WarrantyService.process_warranty_claim(
                warranty_claim=claim,
                action='complete',
                user=request.user
            )
            
            serializer = self.get_serializer(claim)
            return Response(serializer.data)
            
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def reject_claim(self, request, pk=None):
        """Từ chối warranty claim"""
        try:
            claim = self.get_object()
            rejection_reason = request.data.get('rejection_reason', '')
            
            if not claim.can_be_rejected():
                return Response(
                    {'error': 'Claim cannot be rejected in current status'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Xử lý claim
            WarrantyService.process_warranty_claim(
                warranty_claim=claim,
                action='reject',
                user=request.user
            )
            
            serializer = self.get_serializer(claim)
            return Response(serializer.data)
            
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def processing_days(self, request, pk=None):
        """Lấy số ngày xử lý claim"""
        try:
            claim = self.get_object()
            processing_days = claim.get_processing_days()
            is_overdue = claim.is_overdue()
            
            return Response({
                'claim_id': claim.id,
                'claim_number': claim.claim_number,
                'processing_days': processing_days,
                'is_overdue': is_overdue,
                'estimated_completion_date': claim.estimated_completion_date,
                'status': claim.status
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def assign_technician(self, request, pk=None):
        """Gán technician cho claim"""
        try:
            claim = self.get_object()
            technician_id = request.data.get('technician_id')
            
            if not technician_id:
                return Response(
                    {'error': 'Technician ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Lấy technician
            from apps.stores.models.employee import Employee
            technician = Employee.objects.filter(id=technician_id, is_deleted=False).first()
            
            if not technician:
                return Response(
                    {'error': 'Technician not found'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Gán technician
            claim.technician = technician
            claim.updated_by = request.user
            claim.save()
            
            serializer = self.get_serializer(claim)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 