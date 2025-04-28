from rest_framework import viewsets
from apps.content.models.banner import Banner
from apps.content.serializers.banner_serializer import BannerSerializer
from apps.core.utils import IsAdminUser

class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['title', 'position', 'is_active']
    search_fields = ['title']
    ordering_fields = ['position', 'created_at']
    ordering = ['position', '-created_at'] 