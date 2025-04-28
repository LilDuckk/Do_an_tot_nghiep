from rest_framework import viewsets
from apps.content.models.footer import Footer
from apps.content.serializers.footer_serializer import FooterSerializer
from apps.core.utils import IsAdminUser

class FooterViewSet(viewsets.ModelViewSet):
    queryset = Footer.objects.all()
    serializer_class = FooterSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['title', 'position', 'is_active']
    search_fields = ['title', 'content']
    ordering_fields = ['position', 'created_at']
    ordering = ['position', '-created_at'] 