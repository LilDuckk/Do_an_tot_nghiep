from rest_framework import viewsets
from rest_framework.permissions import DjangoModelPermissions, AllowAny
from apps.products.models.product import ProductImage
from apps.products.serializers.product_image_serializer import ProductImageSerializer

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    filterset_fields = ['product', 'is_primary']
    search_fields = ['image_url', 'alt_text']
    ordering_fields = ['display_order', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Cho phép truy cập public cho các action GET
        Yêu cầu quyền admin cho các action thay đổi dữ liệu
        """
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [DjangoModelPermissions()] 