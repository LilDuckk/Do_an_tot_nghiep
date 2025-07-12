from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.users.serializers.reset_password_serializer import ResetPasswordSerializer
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_user_password(request):
    """
    Reset mật khẩu của một tài khoản
    
    - Nếu tài khoản là employee: reset về employee_code
    - Nếu không phải employee: tạo random password 8 ký tự
    
    Chỉ SuperUser hoặc StoreEmployee mới có quyền thực hiện
    """
    # Kiểm tra quyền
    if not (request.user.is_superuser or IsStoreEmployee().has_permission(request, None)):
        return Response({
            'success': False,
            'message': 'Bạn không có quyền thực hiện hành động này.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = ResetPasswordSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            result = serializer.save()
            return Response({
                'success': True,
                'message': result['message'],
                'data': {
                    'user_id': result['user_id'],
                    'username': result['username'],
                    'email': result['email'],
                    'password_source': result['password_source'],
                    'new_password': result['new_password']
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Có lỗi xảy ra khi reset mật khẩu: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        return Response({
            'success': False,
            'message': 'Dữ liệu không hợp lệ',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST) 