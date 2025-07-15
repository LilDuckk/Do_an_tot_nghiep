from rest_framework import viewsets
from django.contrib.auth.models import Group, Permission
from rest_framework import serializers
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.permissions import IsAuthenticated, AllowAny, OR


class GroupSerializer(serializers.ModelSerializer):
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'user_count']

    def get_user_count(self, obj):
        return obj.user_set.count()

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'content_type']

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializer
    ordering_fields = ['name', 'id']
    ordering = ['name']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết nhóm
            return [AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def all(self, request):
        """Get all groups without pagination for selection purposes"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['name']
    filterset_fields = ['content_type']
    ordering_fields = ['name']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết quyền
            return [IsStoreEmployee()]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def all(self, request):
        """Get all permissions without pagination for selection purposes"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
