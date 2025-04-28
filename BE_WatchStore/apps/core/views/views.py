from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from ..models.audit_log import AuditLog
from ..serializers import AuditLogSerializer

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet để xem lịch sử thay đổi của các bản ghi
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['content_type', 'object_id', 'action', 'user']
    search_fields = ['ip_address', 'user_agent']
    ordering_fields = ['created_at']
    ordering = ['-created_at'] 