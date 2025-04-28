from rest_framework import viewsets
from apps.users.models.role import Role
from apps.users.serializers.role_serializer import RoleSerializer
from apps.core.utils import IsAdminUser

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['name']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at'] 