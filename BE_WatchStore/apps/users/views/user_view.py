from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.users.models.user import UserAccount
from apps.users.serializers.user_serializer import UserSerializer
from apps.users.serializers.auth.change_password_serializer import ChangePasswordSerializer
from apps.core.utils import IsAdminUser

class UserViewSet(viewsets.ModelViewSet):
    queryset = UserAccount.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['is_active', 'is_staff']
    search_fields = ['username', 'email']  # ✅ Nếu model không có first_name, last_name
    ordering_fields = ['username', 'email', 'created_at']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request, pk=None):
        user = self.get_object()
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user.set_password(serializer.validated_data['password'])
            user.save()
            return Response({'status': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
