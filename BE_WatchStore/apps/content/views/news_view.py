from rest_framework import viewsets
from apps.content.models.news import News
from apps.content.serializers.news_serializer import NewsSerializer
from rest_framework.permissions import DjangoModelPermissions, AllowAny

class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    filterset_fields = ['title', 'is_active']
    search_fields = ['title', 'content']
    ordering_fields = ['published_date', 'created_at']
    ordering = ['-published_date', '-created_at'] 

    def get_permissions(self):
        """
        Cho phép truy cập public cho các action GET
        Yêu cầu quyền admin cho các action thay đổi dữ liệu
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            return [AllowAny()]
        return [DjangoModelPermissions()]