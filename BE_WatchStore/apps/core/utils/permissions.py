from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Allows access only to the owner of the object or admin users.
    """
    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or obj.user == request.user

class IsStoreAdmin(permissions.BasePermission):
    """
    Allows access only to store admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff and hasattr(request.user, 'store') 