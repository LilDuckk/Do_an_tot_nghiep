from threading import current_thread

class UserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self._user = {}

    def __call__(self, request):
        self._user[current_thread()] = request.user
        response = self.get_response(request)
        if current_thread() in self._user:
            del self._user[current_thread()]
        return response

    @classmethod
    def get_current_user(cls):
        return cls._user.get(current_thread()) 