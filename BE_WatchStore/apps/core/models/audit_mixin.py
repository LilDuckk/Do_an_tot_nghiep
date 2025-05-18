from django.db import models
from django.contrib.auth.models import AnonymousUser
from threading import local
from apps.core.models.audit_log import AuditLog
from apps.core.middleware import CurrentUserMiddleware
import logging
import traceback
import threading
import inspect

logger = logging.getLogger(__name__)

def get_current_user():
    """
    Comprehensive user retrieval with extensive logging and diagnostics
    """
    try:
        # Extensive logging of call stack and context
        def log_call_stack():
            stack = inspect.stack()
            logger.warning("Call Stack:")
            for frame in stack[1:6]:  # Log up to 5 frames
                logger.warning(f"  File: {frame.filename}, Line: {frame.lineno}, Function: {frame.function}")

        # Attempt to retrieve user from various sources
        user = None

        # 1. Try middleware-based user retrieval
        try:
            user = CurrentUserMiddleware.get_current_user()
            if user:
                logger.info(f"User retrieved via middleware: {user.username}")
        except Exception as middleware_error:
            logger.error(f"Middleware user retrieval error: {middleware_error}")
            logger.error(traceback.format_exc())

        # 2. If no user, attempt alternative retrieval methods
        if user is None:
            try:
                # Import user-related modules
                from django.contrib.auth import get_user_model
                from django.apps import apps

                # Log detailed context information
                logger.warning("No user found in primary retrieval methods")
                
                # Get current thread information
                current_thread = threading.current_thread()
                logger.warning(f"Current Thread: {current_thread.name}")
                
                # Log call stack for context
                log_call_stack()

                # Check active users in the system
                UserModel = apps.get_model('users', 'UserAccount')
                active_users = UserModel.objects.filter(is_active=True)
                logger.warning(f"Total active users in system: {active_users.count()}")

                # Additional diagnostic logging
                logger.warning("Detailed thread local storage contents:")
                try:
                    from threading import local
                    _thread_locals = local()
                    logger.warning(f"Thread local storage: {vars(_thread_locals)}")
                except Exception as storage_error:
                    logger.error(f"Error accessing thread local storage: {storage_error}")

            except Exception as alt_error:
                logger.error(f"Comprehensive user retrieval error: {alt_error}")
                logger.error(traceback.format_exc())

        # Final user validation
        if user is not None:
            # Validate user is not an AnonymousUser
            if isinstance(user, AnonymousUser):
                logger.warning("Retrieved user is an AnonymousUser")
                user = None
            else:
                logger.info(f"Final user retrieved: {user.username} (ID: {user.id})")
        else:
            logger.warning("Unable to retrieve authenticated user through any method")

        return user

    except Exception as final_error:
        logger.error(f"Catastrophic error in user retrieval: {final_error}")
        logger.error(traceback.format_exc())
        return None

class AuditLogMixin(models.Model):
    """
    Mixin để tự động lưu audit log cho các thao tác CRUD
    """
    class Meta:
        abstract = True

    def _normalize_model_name(self, model_name):
        """
        Normalize model name to ensure consistent tracking
        """
        # Special handling for UserAccount model
        if model_name in ['UserAccount', 'useraccount']:
            return 'users.useraccount'
        return model_name

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if not is_new:
            old_instance = self.__class__.objects.get(pk=self.pk)
            old_values = {
                field.name: getattr(old_instance, field.name)
                for field in self._meta.fields
                if field.name not in ['created_at', 'updated_at', 'is_deleted']
            }
        else:
            old_values = None

        super().save(*args, **kwargs)

        # Lấy user hiện tại
        user = get_current_user()
        user_id = user.id if user else None
        
        # Normalize model name
        normalized_model_name = self._normalize_model_name(self.__class__.__name__)
        
        # Log additional context for debugging
        logger.info(f"Creating audit log: action={'CREATE' if is_new else 'UPDATE'}, model={normalized_model_name}, user_id={user_id}")

        # Tạo audit log
        new_values = {
            field.name: getattr(self, field.name)
            for field in self._meta.fields
            if field.name not in ['created_at', 'updated_at', 'is_deleted']
        }

        AuditLog.objects.create(
            action='CREATE' if is_new else 'UPDATE',
            model_name=normalized_model_name,
            object_id=str(self.pk),
            old_values=old_values,
            new_values=new_values,
            user_id=user_id
        )

    def delete(self, *args, **kwargs):
        # Lấy user hiện tại
        user = get_current_user()
        user_id = user.id if user else None

        # Normalize model name
        normalized_model_name = self._normalize_model_name(self.__class__.__name__)

        # Tạo audit log trước khi xóa
        old_values = {
            field.name: getattr(self, field.name)
            for field in self._meta.fields
            if field.name not in ['created_at', 'updated_at', 'is_deleted']
        }

        AuditLog.objects.create(
            action='DELETE',
            model_name=normalized_model_name,
            object_id=str(self.pk),
            old_values=old_values,
            new_values=None,
            user_id=user_id
        )

        super().delete(*args, **kwargs)
