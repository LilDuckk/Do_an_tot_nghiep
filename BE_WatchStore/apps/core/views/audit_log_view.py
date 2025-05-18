from rest_framework import viewsets
from apps.core.models.audit_log import AuditLog
from apps.core.serializers.audit_log_serializer import AuditLogSerializer
from apps.core.utils import IsAdminUser
from rest_framework.response import Response
from rest_framework import status

class AuditLogViewSet(viewsets.ModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['action', 'model_name', 'object_id', 'created_at']
    search_fields = ['action', 'model_name', 'object_id']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        """
        Lưu user_id khi tạo audit log
        """
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        """
        Lưu user_id khi cập nhật audit log
        """
        serializer.save(user=self.request.user) 