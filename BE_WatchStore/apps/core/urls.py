from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.core.views.audit_log_view import AuditLogViewSet

router = DefaultRouter()
router.register(r'audit-logs', AuditLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 