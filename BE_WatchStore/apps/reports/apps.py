from django.apps import AppConfig


class ReportsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.reports'
    verbose_name = 'Báo cáo thống kê'

    def ready(self):
        import apps.reports.models

    def get_permissions(self):
        """
        Định nghĩa permissions cho reports app
        """
        return [
            ("view_reports", "Có thể xem thống kê báo cáo"),
        ] 