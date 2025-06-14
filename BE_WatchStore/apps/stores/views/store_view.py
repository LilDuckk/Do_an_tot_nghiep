from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count
from apps.stores.models.store import Store
from apps.stores.serializers.store_serializer import StoreSerializer
from apps.core.utils.permissions import IsAdminUser

class StoreViewSet(viewsets.ModelViewSet):
    queryset = Store.objects.filter(is_deleted=False)
    serializer_class = StoreSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'address', 'phone']
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve', 'list_all', 'employee_count']:
            # Cho phép user đã đăng nhập xem danh sách và chi tiết cửa hàng
            return [IsAuthenticated()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def employee_count(self, request, pk=None):
        store = self.get_object()
        employee_count = store.employees.filter(is_deleted=False).count()
        return Response({'employee_count': employee_count}) 