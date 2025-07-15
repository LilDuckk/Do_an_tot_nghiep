from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, OR
from apps.users.models.user import UserAccount
from apps.users.serializers.user_serializer import UserSerializer
from apps.users.serializers.auth.change_password_serializer import ChangePasswordSerializer
from apps.core.utils.permissions import IsSuperUser, IsStoreEmployee

class UserViewSet(viewsets.ModelViewSet):
    queryset = UserAccount.objects.filter(is_deleted=False)
    serializer_class = UserSerializer
    filterset_fields = ['is_active', 'is_staff']
    search_fields = ['username', 'email']
    ordering_fields = ['username', 'email', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Tùy chỉnh permission cho từng action
        """
        if self.action in ['list', 'retrieve']:
            # Cho phép tất cả người dùng xem danh sách và chi tiết người dùng
            return [IsStoreEmployee()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Cho phép superuser hoặc nhân viên cửa hàng có quyền tương ứng
            return [OR(IsSuperUser(), IsStoreEmployee())]
        elif self.action in ['change_password']:
            # Cho phép user thay đổi mật khẩu của chính họ
            return [IsAuthenticated()]
        elif self.action in ['list_all']:
            # Cho phép user đã đăng nhập xem danh sách
            return [IsAuthenticated()]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def change_password(self, request, pk=None):
        user = self.get_object()
        # Chỉ cho phép user thay đổi mật khẩu của chính họ
        if user != request.user and not request.user.is_superuser:
            return Response(
                {"detail": "Bạn không có quyền thay đổi mật khẩu của người khác"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            # Kiểm tra mật khẩu cũ
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': ['Mật khẩu cũ không đúng']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Đổi mật khẩu mới
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'status': 'Đổi mật khẩu thành công'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='all', url_name='all')
    def list_all(self, request):
        """
        Lấy tất cả user đang active và chưa bị xóa với khả năng tìm kiếm và lọc
        """
        queryset = self.get_queryset().filter(is_active=True)
        
        # Áp dụng bộ lọc
        queryset = self.filter_queryset(queryset)
        
        # Áp dụng tìm kiếm
        search_query = request.query_params.get('search', None)
        if search_query:
            try:
                # Thử chuyển đổi search_query thành số để tìm theo ID
                search_id = int(search_query)
                queryset = queryset.filter(id=search_id)
            except ValueError:
                # Nếu không phải số, tìm theo username và email
                queryset = queryset.filter(
                    username__icontains=search_query
                ) | queryset.filter(
                    email__icontains=search_query
                )
        
        # Áp dụng sắp xếp
        ordering = request.query_params.get('ordering', '-created_at')
        if ordering:
            queryset = queryset.order_by(ordering)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
