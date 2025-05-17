from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import DjangoModelPermissions, AllowAny
from apps.products.models.product import Product
from apps.products.serializers.product_serializer import ProductSerializer
from apps.products.serializers.product_create_serializer import ProductCreateSerializer
from apps.products.filters import ProductFilter
import os

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    parser_classes = [MultiPartParser, FormParser]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'base_price', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Cho phép truy cập public cho các action GET
        Yêu cầu quyền admin cho các action thay đổi dữ liệu
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            return [AllowAny()]
        return [DjangoModelPermissions()]

    def get_parsers(self):
        if hasattr(self, 'action') and self.action in ['create_with_images', 'update_with_images']:
            return [MultiPartParser(), FormParser()]
        return super().get_parsers()

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='create_with_images', url_name='create_with_images')
    def create_with_images(self, request):
        serializer = ProductCreateSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            return Response(ProductCreateSerializer(product).data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['put', 'patch'], url_path='update_with_images', url_name='update_with_images')
    def update_with_images(self, request, pk=None):
        instance = self.get_object()
        serializer = ProductCreateSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            product = serializer.save()
            return Response(ProductCreateSerializer(product).data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Xóa tất cả ảnh của sản phẩm
        for image in instance.images.all():
            # Xóa file ảnh từ storage
            if image.image:
                if os.path.isfile(image.image.path):
                    os.remove(image.image.path)
            # Xóa record ảnh từ database
            image.delete()
        
        # Xóa sản phẩm
        self.perform_destroy(instance)
        return Response(status=204) 