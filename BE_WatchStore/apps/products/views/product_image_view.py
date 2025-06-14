from rest_framework import viewsets
from apps.products.models.product import ProductImage
from apps.products.serializers.product_image_serializer import ProductImageSerializer
from apps.core.utils.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated, AllowAny

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['product', 'is_primary']
    search_fields = ['image_url', 'alt_text']
    ordering_fields = ['display_order', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết ảnh sản phẩm
            return [AllowAny()]
        return super().get_permissions() 