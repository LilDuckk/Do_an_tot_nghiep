from rest_framework import permissions
import logging

logger = logging.getLogger(__name__)

class IsSuperUser(permissions.BasePermission):
    """
    Cho phép truy cập chỉ với superuser
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)

class IsStoreEmployee(permissions.BasePermission):
    """
    Cho phép truy cập với nhân viên cửa hàng có quyền tương ứng
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            logger.warning(f"User not authenticated")
            return False
            
        # Superuser luôn có quyền
        if request.user.is_superuser:
            logger.info(f"User {request.user.username} is superuser")
            return True
            
        # Lấy tên model từ view
        model_name = view.queryset.model._meta.model_name
        app_label = view.queryset.model._meta.app_label
        
        # Tạo tên quyền dựa trên action và model
        permission_map = {
            'list': 'view',
            'retrieve': 'view',
            'create': 'add',
            'update': 'change',
            'partial_update': 'change',
            'destroy': 'delete'
        }
        
        action = getattr(view, 'action', None)
        if action not in permission_map:
            logger.warning(f"Action {action} not in permission map")
            return False
            
        permission_codename = f"{permission_map[action]}_{model_name}"
        required_permission = f"{app_label}.{permission_codename}"
        
        logger.info(f"Checking permission for user {request.user.username}")
        logger.info(f"Required permission: {required_permission}")
        logger.info(f"User permissions: {list(request.user.get_all_permissions())}")
        logger.info(f"User groups: {[g.name for g in request.user.groups.all()]}")
        logger.info(f"User direct permissions: {[p.codename for p in request.user.user_permissions.all()]}")
        
        # Kiểm tra quyền trước
        has_perm = request.user.has_perm(required_permission)
        logger.info(f"User has required permission {required_permission}: {has_perm}")
        
        if not has_perm:
            logger.warning(f"User {request.user.username} does not have required permission {required_permission}")
            return False
            
        # Kiểm tra xem user có phải là employee của cửa hàng không
        try:
            from apps.stores.models.employee import Employee
            employee = Employee.objects.get(user=request.user, is_deleted=False)
            if not employee or not employee.store:
                logger.warning(f"User {request.user.username} is not an active employee or has no store")
                return False
                
            logger.info(f"User {request.user.username} is employee of store {employee.store.id}")
            return True
            
        except Employee.DoesNotExist:
            logger.warning(f"User {request.user.username} is not an employee")
            return False

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Superuser luôn có quyền
        if request.user.is_superuser:
            return True
            
        # Kiểm tra xem đối tượng có thuộc cửa hàng của employee không
        try:
            from apps.stores.models.employee import Employee
            employee = Employee.objects.get(user=request.user, is_deleted=False)
            if not employee or not employee.store:
                return False
                
            # Kiểm tra quyền cụ thể
            model_name = view.queryset.model._meta.model_name
            app_label = view.queryset.model._meta.app_label
            permission_codename = f"view_{model_name}"
            required_permission = f"{app_label}.{permission_codename}"
            
            logger.info(f"Checking object permission for user {request.user.username}")
            logger.info(f"Required permission: {required_permission}")
            logger.info(f"User permissions: {list(request.user.get_all_permissions())}")
            
            has_permission = bool(employee.store == getattr(obj, 'store', None) and 
                       request.user.has_perm(required_permission))
            logger.info(f"User has required permission: {has_permission}")
            return has_permission
            
        except Employee.DoesNotExist:
            return False