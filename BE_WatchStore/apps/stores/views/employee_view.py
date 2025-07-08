from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny, OR
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.stores.models.employee import Employee
from apps.stores.serializers.employee_serializer import EmployeeSerializer
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all().filter(is_deleted=False)
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['store', 'position', 'is_manager']
    search_fields = ['name', 'phone', 'employee_code']
    ordering_fields = ['name', 'hire_date', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết nhân viên
            return [IsStoreEmployee()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, updated_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=['get'])
    def list_all(self, request):
        """Lấy tất cả nhân viên không phân trang"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data) 