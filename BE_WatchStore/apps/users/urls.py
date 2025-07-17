from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.users.views.user_view import UserViewSet
from apps.users.views.auth_view import LoginAPIView, MeAPIView, ChangePasswordAPIView, CheckPermissionAPIView
from apps.users.views.reset_password_view import reset_user_password
from apps.users.views.group_permission_view import GroupViewSet, PermissionViewSet
from rest_framework_simplejwt.views import TokenVerifyView

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'auth/groups', GroupViewSet, basename='group')
router.register(r'auth/permissions', PermissionViewSet, basename='permission')

urlpatterns = [
    # 🔁 CRUD endpoints
    path('', include(router.urls)),

    # 🔐 Auth endpoints
    path('auth/login/', LoginAPIView.as_view(), name='login'),
    path('auth/me/', MeAPIView.as_view(), name='me'),
    path('auth/change-password/', ChangePasswordAPIView.as_view(), name='change-password'),
    path('auth/check-permissions/', CheckPermissionAPIView.as_view(), name='check-permissions'),
    path('auth/reset-password/', reset_user_password, name='reset-password'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]
