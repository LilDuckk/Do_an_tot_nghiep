from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.core.exceptions import ValidationError
from apps.warranty.models.warranty import Warranty
from apps.warranty.serializers.warranty_serializer import WarrantySerializer
from apps.warranty.services import WarrantyService
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, AllowAny, OR
from django.utils import timezone

class WarrantyViewSet(viewsets.ModelViewSet):
    queryset = Warranty.objects.all()
    serializer_class = WarrantySerializer
    filterset_fields = ['product', 'variant', 'status']
    search_fields = ['warranty_number']
    ordering_fields = ['warranty_number', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết bảo hành
            return [IsStoreEmployee()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Lấy thống kê warranty"""
        try:
            stats = WarrantyService.get_warranty_statistics()
            return Response(stats)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def active_warranties(self, request):
        """Lấy danh sách warranty còn hiệu lực"""
        try:
            warranties = self.get_queryset().filter(status='ACTIVE')
            serializer = self.get_serializer(warranties, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def expired_warranties(self, request):
        """Lấy danh sách warranty đã hết hạn"""
        try:
            warranties = self.get_queryset().filter(status='EXPIRED')
            serializer = self.get_serializer(warranties, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def extend_warranty(self, request, pk=None):
        """Gia hạn warranty"""
        try:
            warranty = self.get_object()
            extension_days = request.data.get('extension_days', 30)
            
            if extension_days <= 0:
                return Response(
                    {'error': 'Extension days must be positive'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Gia hạn warranty
            warranty.warranty_end_date += timezone.timedelta(days=extension_days)
            warranty.status = 'ACTIVE'
            warranty.updated_by = request.user
            warranty.save()
            
            serializer = self.get_serializer(warranty)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def remaining_days(self, request, pk=None):
        """Lấy số ngày còn lại của warranty"""
        try:
            warranty = self.get_object()
            remaining_days = warranty.get_remaining_days()
            
            return Response({
                'warranty_id': warranty.id,
                'warranty_number': warranty.warranty_number,
                'remaining_days': remaining_days,
                'is_active': warranty.is_active(),
                'is_expired': warranty.is_expired()
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def create_claim(self, request, pk=None):
        """Tạo warranty claim"""
        try:
            warranty = self.get_object()
            description = request.data.get('description')
            
            if not description:
                return Response(
                    {'error': 'Description is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Kiểm tra warranty còn hiệu lực không
            if not warranty.is_active():
                return Response(
                    {'error': 'Warranty is not active or has expired'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Tạo warranty claim
            from apps.warranty.models.warranty_claim import WarrantyClaim
            claim = WarrantyClaim.create_from_warranty(
                warranty=warranty,
                description=description,
                user=request.user
            )
            
            from apps.warranty.serializers.warranty_claim_serializer import WarrantyClaimSerializer
            serializer = WarrantyClaimSerializer(claim)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
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