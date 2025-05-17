from rest_framework import viewsets
from apps.content.models.footer import FooterCategory, FooterLink
from apps.content.serializers.footer_serializer import FooterCategorySerializer, FooterLinkSerializer
from rest_framework.permissions import DjangoModelPermissions, AllowAny

class FooterCategoryViewSet(viewsets.ModelViewSet):
    queryset = FooterCategory.objects.all().order_by('display_order')
    serializer_class = FooterCategorySerializer

    def get_permissions(self):
        """
        Cho phép truy cập public cho các action GET
        Yêu cầu quyền admin cho các action thay đổi dữ liệu
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            return [AllowAny()]
        return [DjangoModelPermissions()]


class FooterLinkViewSet(viewsets.ModelViewSet):
    queryset = FooterLink.objects.select_related('category').all().order_by('display_order')
    serializer_class = FooterLinkSerializer

    def get_permissions(self):
        """
        Cho phép truy cập public cho các action GET
        Yêu cầu quyền admin cho các action thay đổi dữ liệu
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            return [AllowAny()]
        return [DjangoModelPermissions()]