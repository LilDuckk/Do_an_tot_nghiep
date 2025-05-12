from threading import local

class UserMiddleware:
    _user = local()  # Sử dụng threading.local để lưu trữ dữ liệu theo thread

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        self.set_current_user(request.user)
        response = self.get_response(request)
        self.set_current_user(None)
        return response

    @classmethod
    def set_current_user(cls, user):
        cls._user.user = user  # Đặt user hiện tại

    @classmethod
    def get_current_user(cls):
        return getattr(cls._user, 'user', None)  # Lấy user hiện tại hoặc trả về None