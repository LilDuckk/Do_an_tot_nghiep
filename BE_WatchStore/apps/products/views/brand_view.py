from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.products.models.brand import Brand
from apps.products.serializers.brand_serializer import BrandSerializer
from apps.core.utils.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['name']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết thương hiệu
            return [IsAuthenticated()]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data) 