from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from .serializers import UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        if username is None or password is None:
            return Response({
                'error': 'Vui lòng cung cấp tên đăng nhập và mật khẩu'
            }, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)

        if user is None:
            return Response({
                'error': 'Tên đăng nhập hoặc mật khẩu không đúng'
            }, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)

        # Kiểm tra role của user
        is_superuser = user.is_superuser
        is_staff = user.is_staff

        role = 'superadmin' if is_superuser else ('admin' if is_staff else 'user')

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': role
            }
        })

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        is_superuser = user.is_superuser
        is_staff = user.is_staff
        role = 'superadmin' if is_superuser else ('admin' if is_staff else 'user')

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': role
        }) 