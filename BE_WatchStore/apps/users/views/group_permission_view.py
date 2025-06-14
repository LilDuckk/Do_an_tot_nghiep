from rest_framework import viewsets
from django.contrib.auth.models import Group, Permission
from rest_framework import serializers
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from apps.core.utils.permissions import IsAdminUser


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
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAdminUser]
    search_fields = ['name']
    ordering_fields = ['name']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['all']:
            # Cho phép user có quyền view xem danh sách
            return [IsAdminUser()]
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
    permission_classes = [IsAdminUser]
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['name']
    filterset_fields = ['content_type']
    ordering_fields = ['name']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['all']:
            # Cho phép user có quyền view xem danh sách
            return [IsAdminUser()]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def all(self, request):
        """Get all permissions without pagination for selection purposes"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
