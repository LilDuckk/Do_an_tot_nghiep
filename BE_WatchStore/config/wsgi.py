import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('BE_WATCHSTORE', 'config.settings')  # Tên đúng project bạn

application = get_wsgi_application()
