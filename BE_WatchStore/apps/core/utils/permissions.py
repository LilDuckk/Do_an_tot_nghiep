from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to users with admin permissions.
    """
    def has_permission(self, request, view):
        # Kiểm tra xem user có quyền view, add, change, delete của model không
        return request.user and (
            request.user.has_perm('users.view_useraccount') and
            request.user.has_perm('users.add_useraccount') and
            request.user.has_perm('users.change_useraccount') and
            request.user.has_perm('users.delete_useraccount')
        )

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Allows access only to the owner of the object or users with admin permissions.
    """
    def has_object_permission(self, request, view, obj):
        # Kiểm tra quyền admin hoặc là chủ sở hữu
        is_admin = (
            request.user.has_perm('users.view_useraccount') and
            request.user.has_perm('users.change_useraccount')
        )
        return is_admin or obj.user == request.user

class IsStoreAdmin(permissions.BasePermission):
    """
    Allows access only to users with store admin permissions.
    """
    def has_permission(self, request, view):
        # Kiểm tra quyền quản lý cửa hàng và có thuộc tính store
        return (
            request.user and 
            request.user.has_perm('stores.manage_store') and 
            hasattr(request.user, 'store')
        ) 