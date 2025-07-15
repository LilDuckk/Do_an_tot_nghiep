from rest_framework import viewsets
from apps.core.models.audit_log import AuditLog
from apps.core.serializers.audit_log_serializer import AuditLogSerializer
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny, OR

class AuditLogViewSet(viewsets.ModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    filterset_fields = ['action', 'model_name', 'object_id', 'created_at']
    search_fields = ['action', 'model_name', 'object_id']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết nhật ký kiểm toán
            return [IsStoreEmployee()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        return super().get_permissions()

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