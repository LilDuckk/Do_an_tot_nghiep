from rest_framework import viewsets
from apps.content.models.news import News
from apps.content.serializers.news_serializer import NewsSerializer
from apps.core.utils import IsAdminUser

class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['title', 'is_active']
    search_fields = ['title', 'content']
    ordering_fields = ['published_date', 'created_at']
    ordering = ['-published_date', '-created_at'] 