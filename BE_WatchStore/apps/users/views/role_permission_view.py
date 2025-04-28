from rest_framework import viewsets
from apps.users.models.role_permission import RolePermission
from apps.users.serializers.role_permission_serializer import RolePermissionSerializer
from apps.core.utils import IsAdminUser

class RolePermissionViewSet(viewsets.ModelViewSet):
    queryset = RolePermission.objects.all()
    serializer_class = RolePermissionSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['role', 'permission']
    ordering_fields = ['created_at']
    ordering = ['-created_at'] 