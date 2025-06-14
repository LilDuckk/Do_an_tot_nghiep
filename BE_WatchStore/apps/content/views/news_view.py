from rest_framework import viewsets
from apps.content.models.news import News
from apps.content.serializers.news_serializer import NewsSerializer
from rest_framework.permissions import IsAuthenticated
from apps.core.utils.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import action

class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['title', 'is_active']
    search_fields = ['title', 'content']
    ordering_fields = ['published_date', 'created_at']
    ordering = ['-published_date', '-created_at'] 

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết tin tức
            return [IsAuthenticated()]
        return super().get_permissions()

    @action(detail=False, methods=['get'], url_path='all', url_name='all')
    def list_all(self, request):
        """
        Lấy tất cả tin tức đang active
        """
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)