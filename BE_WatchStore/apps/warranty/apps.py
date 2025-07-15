from django.apps import AppConfig

class WarrantyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.warranty'
    verbose_name = 'Quản lý bảo hành'
    
    def ready(self):
        """Import signals khi app được load"""
        import apps.warranty.signals 