from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.products.models.brand import Brand
from apps.products.serializers.brand_serializer import BrandSerializer
from rest_framework.permissions import DjangoModelPermissions, AllowAny

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    filterset_fields = ['name']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Cho phép truy cập public cho các action GET
        Yêu cầu quyền admin cho các action thay đổi dữ liệu
        """
        if self.action in ['list', 'retrieve', 'list_all']:
            return [AllowAny()]
        return [DjangoModelPermissions()]

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data) 