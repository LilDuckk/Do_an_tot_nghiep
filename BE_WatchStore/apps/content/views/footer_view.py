from rest_framework import viewsets
from apps.content.models.footer import FooterCategory, FooterLink
from apps.content.serializers.footer_serializer import FooterCategorySerializer, FooterLinkSerializer
from apps.core.utils import IsAdminUser

class FooterCategoryViewSet(viewsets.ModelViewSet):
    queryset = FooterCategory.objects.all().order_by('display_order')
    serializer_class = FooterCategorySerializer
    permission_classes = [IsAdminUser]


class FooterLinkViewSet(viewsets.ModelViewSet):
    queryset = FooterLink.objects.select_related('category').all().order_by('display_order')
    serializer_class = FooterLinkSerializer
    permission_classes = [IsAdminUser]