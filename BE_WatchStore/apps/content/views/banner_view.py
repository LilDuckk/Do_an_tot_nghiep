from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.content.models.banner import Banner
from apps.content.serializers.banner_serializer import BannerSerializer
from apps.core.utils.permissions import IsAdminUser
import os

class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAdminUser]
    filterset_fields = ['title', 'banner_location', 'is_active']
    search_fields = ['title']
    ordering_fields = ['display_order', 'created_at']
    ordering = ['display_order', '-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết banner
            return [IsAuthenticated()]
        return super().get_permissions()

    @action(detail=False, methods=['get'], url_path='all', url_name='all')
    def list_all(self, request):
        """
        Lấy tất cả banner đang active
        """
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Xóa file ảnh từ storage
        if instance.image:
            if os.path.isfile(instance.image.path):
                os.remove(instance.image.path)
        
        # Xóa banner
        self.perform_destroy(instance)
        return Response(status=204) 