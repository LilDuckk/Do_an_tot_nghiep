from rest_framework import viewsets
from apps.content.models.footer import FooterCategory, FooterLink
from apps.content.serializers.footer_serializer import FooterCategorySerializer, FooterLinkSerializer
from rest_framework.permissions import IsAuthenticated
from apps.core.utils.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import action

class FooterCategoryViewSet(viewsets.ModelViewSet):
    queryset = FooterCategory.objects.all().order_by('display_order')
    serializer_class = FooterCategorySerializer
    permission_classes = [IsAdminUser]

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết footer category
            return [IsAuthenticated()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'], url_path='all', url_name='all')
    def list_all(self, request):
        """
        Lấy tất cả footer category đang active
        """
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class FooterLinkViewSet(viewsets.ModelViewSet):
    queryset = FooterLink.objects.select_related('category').all().order_by('display_order')
    serializer_class = FooterLinkSerializer
    permission_classes = [IsAdminUser]

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết footer link
            return [IsAuthenticated()]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'], url_path='all', url_name='all')
    def list_all(self, request):
        """
        Lấy tất cả footer link đang active
        """
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)