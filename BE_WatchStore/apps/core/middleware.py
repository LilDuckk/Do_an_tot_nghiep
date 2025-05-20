from threading import local
from django.contrib.auth.models import AnonymousUser
from django.utils.deprecation import MiddlewareMixin
import logging
import traceback
from rest_framework_simplejwt.authentication import JWTAuthentication

logger = logging.getLogger(__name__)

_thread_locals = local()

class CurrentUserMiddleware(MiddlewareMixin):
    def process_request(self, request):
        """
        Explicitly set the current user in thread local storage
        """
        try:
            # Log request details for debugging
            # logger.info(f"Request path: {request.path}")
            # logger.info(f"Request method: {request.method}")
            
            # Check for Authorization header
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            # logger.info(f"Authorization header: {auth_header}")

            # Attempt to authenticate using JWT
            jwt_auth = JWTAuthentication()
            try:
                authenticated = jwt_auth.authenticate(request)
                if authenticated:
                    user, token = authenticated
                    # logger.info(f"User authenticated: {user.username}")
                    _thread_locals.user = user
                else:
                    # logger.warning("No user authenticated by JWT")
                    _thread_locals.user = None
            except Exception as jwt_error:
                logger.error(f"JWT Authentication error: {jwt_error}")
                logger.error(traceback.format_exc())
                _thread_locals.user = None

            # Fallback to request.user
            if _thread_locals.user is None and hasattr(request, 'user'):
                logger.info(f"Fallback to request.user: {request.user}")
                _thread_locals.user = request.user
        except Exception as e:
            logger.error(f"Error setting current user in middleware: {e}")
            logger.error(traceback.format_exc())
            _thread_locals.user = None

    def process_response(self, request, response):
        """
        Clear user from thread local storage after request
        """
        if hasattr(_thread_locals, 'user'):
            del _thread_locals.user
        return response

    @classmethod
    def get_current_user(cls):
        """
        Safely retrieve current user from thread local storage with detailed diagnostics
        """
        try:
            # Retrieve user from thread local storage
            user = getattr(_thread_locals, 'user', None)
            
            # Detailed logging for user retrieval
            if user is None:
                logger.warning("No user found in thread local storage")
                
                # Additional context about thread local storage
                logger.warning(f"Thread local storage contents: {vars(_thread_locals)}")
                
                # Check for potential authentication issues
                from django.contrib.auth import get_user_model
                UserModel = get_user_model()
                
                # Log active users for context
                active_users = UserModel.objects.filter(is_active=True)
                logger.warning(f"Total active users in system: {active_users.count()}")
                
                # Log thread information
                import threading
                current_thread = threading.current_thread()
                logger.warning(f"Current Thread: {current_thread.name}")
            
            # Check if user is an AnonymousUser
            if user is not None and isinstance(user, AnonymousUser):
                logger.warning("User is an AnonymousUser")
                return None
            
            return user
        except Exception as e:
            logger.error(f"Comprehensive error retrieving current user: {e}")
            logger.error(traceback.format_exc())
            return None
