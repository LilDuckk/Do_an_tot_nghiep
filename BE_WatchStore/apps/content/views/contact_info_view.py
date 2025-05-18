from rest_framework import viewsets
from apps.content.models.contact_info import ContactInfo
from apps.content.serializers.contact_info_serializer import ContactInfoSerializer
from rest_framework.permissions import DjangoModelPermissions, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action

class ContactInfoViewSet(viewsets.ModelViewSet):
    queryset = ContactInfo.objects.all()
    serializer_class = ContactInfoSerializer
    filterset_fields = ['title', 'type', 'is_active']
    search_fields = ['title', 'content']
    ordering_fields = ['type', 'created_at']
    ordering = ['type', '-created_at'] 

    def get_permissions(self):
        """
        Cho phép truy cập public cho các action GET
        Yêu cầu quyền admin cho các action thay đổi dữ liệu
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            return [AllowAny()]
        return [DjangoModelPermissions()]
    
    @action(detail=False, methods=['get'], url_path='all', url_name='all')
    def list_all(self, request):
        """
        Lấy tất cả contact info đang active
        """
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)