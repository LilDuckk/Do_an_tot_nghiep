from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import logging

from apps.users.serializers.auth.login_serializer import LoginSerializer
from apps.users.serializers.auth.me_serializer import MeSerializer
from apps.users.serializers.auth.change_password_serializer import ChangePasswordSerializer

logger = logging.getLogger(__name__)

class LoginAPIView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data)


class ChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'detail': 'Old password is incorrect'}, status=400)

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'status': 'Password changed successfully'})


class CheckPermissionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        logger.info(f"Checking permissions for user {user.username}")
        
        # Lấy tất cả quyền
        all_permissions = list(user.get_all_permissions())
        logger.info(f"All permissions: {all_permissions}")
        
        # Lấy quyền trực tiếp
        direct_permissions = [p.codename for p in user.user_permissions.all()]
        logger.info(f"Direct permissions: {direct_permissions}")
        
        # Lấy quyền từ nhóm
        group_permissions = []
        for group in user.groups.all():
            group_permissions.extend([p.codename for p in group.permissions.all()])
        logger.info(f"Group permissions: {group_permissions}")
        
        # Lấy thông tin employee
        employee_info = None
        try:
            from apps.stores.models.employee import Employee
            employee = Employee.objects.get(user=user, is_deleted=False)
            employee_info = {
                'id': employee.id,
                'store_id': employee.store.id if employee.store else None,
                'store_name': employee.store.name if employee.store else None
            }
            logger.info(f"Employee info: {employee_info}")
        except Employee.DoesNotExist:
            logger.warning(f"User {user.username} is not an employee")
        
        return Response({
            'username': user.username,
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
            'groups': [g.name for g in user.groups.all()],
            'all_permissions': all_permissions,
            'direct_permissions': direct_permissions,
            'group_permissions': group_permissions,
            'employee': employee_info
        })
