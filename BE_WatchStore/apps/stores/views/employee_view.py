from rest_framework import viewsets
from apps.stores.models.employee import Employee
from apps.stores.serializers.employee_serializer import EmployeeSerializer
from rest_framework.permissions import DjangoModelPermissions

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [DjangoModelPermissions]
    filterset_fields = ['store', 'position', 'is_active']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    ordering_fields = ['created_at']
    ordering = ['-created_at'] 