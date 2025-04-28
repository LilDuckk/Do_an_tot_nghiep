from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.users.views.user_view import UserViewSet
from apps.users.views.role_view import RoleViewSet
from apps.users.views.permission_view import PermissionViewSet
from apps.users.views.role_permission_view import RolePermissionViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'permissions', PermissionViewSet)
router.register(r'role-permissions', RolePermissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
