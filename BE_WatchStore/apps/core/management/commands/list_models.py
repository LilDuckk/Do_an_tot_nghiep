from django.core.management.base import BaseCommand
from django.apps import apps


class Command(BaseCommand):
    help = 'Liệt kê tất cả models trong dự án Django'

    def add_arguments(self, parser):
        parser.add_argument(
            '--app',
            type=str,
            help='Chỉ liệt kê models của app cụ thể'
        )
        parser.add_argument(
            '--detail',
            action='store_true',
            help='Hiển thị chi tiết fields của mỗi model'
        )

    def handle(self, *args, **options):
        app_name = options['app']
        show_detail = options['detail']

        self.stdout.write(
            self.style.SUCCESS('=== DANH SÁCH MODELS TRONG DỰ ÁN ===')
        )

        # Lấy tất cả models
        all_models = apps.get_models()
        
        # Lọc theo app nếu được chỉ định
        if app_name:
            all_models = [model for model in all_models if model._meta.app_label == app_name]
            if not all_models:
                self.stdout.write(
                    self.style.ERROR(f'Không tìm thấy app "{app_name}"')
                )
                return
            self.stdout.write(f'App: {app_name}')
        else:
            self.stdout.write('Tất cả apps:')

        # Nhóm models theo app
        models_by_app = {}
        for model in all_models:
            app_label = model._meta.app_label
            if app_label not in models_by_app:
                models_by_app[app_label] = []
            models_by_app[app_label].append(model)

        total_models = 0
        
        for app_label, app_models in sorted(models_by_app.items()):
            if not app_name:
                self.stdout.write(f'\n📁 App: {app_label}')
            
            for model in sorted(app_models, key=lambda x: x._meta.model_name):
                total_models += 1
                model_name = model._meta.model_name
                verbose_name = model._meta.verbose_name
                db_table = model._meta.db_table
                
                self.stdout.write(f'  📋 {model_name} ({verbose_name})')
                self.stdout.write(f'      Table: {db_table}')
                
                if show_detail:
                    # Hiển thị fields
                    fields = model._meta.fields
                    if fields:
                        self.stdout.write(f'      Fields ({len(fields)}):')
                        for field in fields:
                            field_type = field.__class__.__name__
                            null_str = " (null)" if field.null else ""
                            self.stdout.write(f'        - {field.name}: {field_type}{null_str}')
                    
                    # Hiển thị relationships
                    relationships = model._meta.related_objects
                    if relationships:
                        self.stdout.write(f'      Relationships ({len(relationships)}):')
                        for rel in relationships:
                            rel_type = rel.__class__.__name__
                            related_model = f"{rel.related_model._meta.app_label}.{rel.related_model._meta.model_name}"
                            self.stdout.write(f'        - {rel.name}: {rel_type} -> {related_model}')
                
                self.stdout.write('')

        self.stdout.write(
            self.style.SUCCESS(f'=== TỔNG CỘNG: {total_models} models ===')
        )

        if not show_detail:
            self.stdout.write(
                self.style.WARNING('Sử dụng --detail để xem chi tiết fields và relationships')
            ) 