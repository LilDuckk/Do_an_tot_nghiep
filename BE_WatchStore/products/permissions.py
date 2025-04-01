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
    Chỉ cho phép chủ sở hữu hoặc admin truy cập
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.user == request.user

class IsStoreManager(permissions.BasePermission):
    """
    Chỉ cho phép quản lý cửa hàng truy cập
    """
    def has_permission(self, request, view):
        return request.user and hasattr(request.user, 'store_manager') 