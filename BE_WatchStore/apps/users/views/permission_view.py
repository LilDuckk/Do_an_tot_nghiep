from rest_framework import viewsets
from apps.users.models.permission import Permission
from apps.users.serializers.permission_serializer import PermissionSerializer
from apps.core.utils import IsAdminUser

class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['name', 'codename']
    search_fields = ['name', 'codename', 'description']
    ordering_fields = ['name', 'codename', 'created_at']
    ordering = ['-created_at'] 