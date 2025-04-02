from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Chỉ cho phép admin truy cập
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class IsCustomer(permissions.BasePermission):
    """
    Chỉ cho phép khách hàng truy cập
    """
    def has_permission(self, request, view):
        return request.user and not request.user.is_staff

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to access it.
    """
    def has_object_permission(self, request, view, obj):
        # Admin có quyền truy cập tất cả
        if request.user.is_staff:
            return True
            
        # Kiểm tra quyền sở hữu cho các model có user
        if hasattr(obj, 'user'):
            return obj.user == request.user
            
        # Kiểm tra quyền sở hữu cho các model có created_by
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
            
        # Mặc định cho phép truy cập
        return True

class IsStoreManager(permissions.BasePermission):
    """
    Chỉ cho phép quản lý cửa hàng truy cập
    """
    def has_permission(self, request, view):
        return request.user and hasattr(request.user, 'store_manager')

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit objects, but allow read access to all users.
    """
    def has_permission(self, request, view):
        # Cho phép đọc với mọi user
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Chỉ admin mới được phép thay đổi
        return request.user.is_staff

class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow authenticated users to edit objects, but allow read access to all users.
    """
    def has_permission(self, request, view):
        # Cho phép đọc với mọi user
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Yêu cầu đăng nhập cho các thao tác khác
        return request.user.is_authenticated 