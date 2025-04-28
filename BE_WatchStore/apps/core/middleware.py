from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model
from django.conf import settings

class AuditLogMiddleware(MiddlewareMixin):
    """
    Middleware để lưu thông tin user và request cho audit log
    """
    def process_request(self, request):
        # Lưu thông tin user và request vào thread local
        if hasattr(request, 'user') and request.user.is_authenticated:
            setattr(settings, 'AUDIT_LOG_USER', request.user)
        else:
            setattr(settings, 'AUDIT_LOG_USER', None)
            
        setattr(settings, 'AUDIT_LOG_IP_ADDRESS', self.get_client_ip(request))
        setattr(settings, 'AUDIT_LOG_USER_AGENT', request.META.get('HTTP_USER_AGENT', ''))

    def get_client_ip(self, request):
        """
        Lấy địa chỉ IP của client
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
