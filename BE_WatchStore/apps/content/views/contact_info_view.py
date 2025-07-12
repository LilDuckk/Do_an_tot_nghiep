from rest_framework import viewsets
from apps.content.models.contact_info import ContactInfo
from apps.content.serializers.contact_info_serializer import ContactInfoSerializer
from rest_framework.permissions import AllowAny, OR
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.response import Response
from rest_framework.decorators import action

class ContactInfoViewSet(viewsets.ModelViewSet):
    queryset = ContactInfo.objects.all()
    serializer_class = ContactInfoSerializer
    filterset_fields = ['is_active']
    search_fields = ['company_name', 'address', 'phone', 'email']
    ordering_fields = ['company_name', 'created_at']
    ordering = ['company_name', '-created_at'] 

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết thông tin liên hệ
            return [AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'], url_path='all', url_name='all')
    def list_all(self, request):
        """
        Lấy tất cả contact info đang active
        """
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)