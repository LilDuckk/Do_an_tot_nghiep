from rest_framework import viewsets
from apps.content.models.contact_info import ContactInfo
from apps.content.serializers.contact_info_serializer import ContactInfoSerializer
from apps.core.utils import IsAdminUser

class ContactInfoViewSet(viewsets.ModelViewSet):
    queryset = ContactInfo.objects.all()
    serializer_class = ContactInfoSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['title', 'type', 'is_active']
    search_fields = ['title', 'content']
    ordering_fields = ['type', 'created_at']
    ordering = ['type', '-created_at'] 