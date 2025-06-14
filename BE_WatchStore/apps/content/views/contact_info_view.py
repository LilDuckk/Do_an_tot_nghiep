from rest_framework import viewsets
from apps.content.models.contact_info import ContactInfo
from apps.content.serializers.contact_info_serializer import ContactInfoSerializer
from rest_framework.permissions import AllowAny
from apps.core.utils.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import action

class ContactInfoViewSet(viewsets.ModelViewSet):
    queryset = ContactInfo.objects.all()
    serializer_class = ContactInfoSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['title', 'type', 'is_active']
    search_fields = ['title', 'content']
    ordering_fields = ['type', 'created_at']
    ordering = ['type', '-created_at'] 

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết contact info
            return [AllowAny()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'], url_path='all', url_name='all')
    def list_all(self, request):
        """
        Lấy tất cả contact info đang active
        """
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)