from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.products.models.brand import Brand
from apps.products.models.category import Category
from apps.products.serializers.brand_serializer import BrandSerializer
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, AllowAny, OR

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    filterset_fields = ['name']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết thương hiệu
            return [AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='active', url_name='active')
    def list_active(self, request):
        """
        Lấy danh sách thương hiệu đang active, sắp xếp theo display_order
        """
        queryset = Brand.objects.filter(
            is_active=True
        ).order_by('display_order', 'name').values('id', 'name', 'slug')
        
        return Response(queryset)

    @action(detail=False, methods=['get'], url_path='categories-and-brands', url_name='categories-and-brands')
    def get_categories_and_brands(self, request):
        """
        Lấy cả danh sách thương hiệu và danh mục đang active trong một lần gọi
        """
        # Lấy danh sách thương hiệu active
        brands = Brand.objects.filter(
            is_active=True
        ).order_by('display_order', 'name').values('id', 'name', 'slug')
        
        # Lấy danh sách danh mục active
        categories = Category.objects.filter(
            is_active=True
        ).select_related('parent').order_by('display_order', 'name').values(
            'id', 'name', 'slug', 'parent'
        )
        
        return Response({
            'brands': list(brands),
            'categories': list(categories)
        }) 