from django.core.management.base import BaseCommand
from django.apps import apps
import json
from datetime import datetime


class Command(BaseCommand):
    help = 'Test export models đơn giản'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            default='test_export.json',
            help='Output file name'
        )

    def handle(self, *args, **options):
        output_file = options['output']

        self.stdout.write(
            self.style.SUCCESS(f'Bắt đầu test export models...')
        )

        # Lấy tất cả models
        all_models = apps.get_models()
        
        models_data = {
            'exported_at': datetime.now().isoformat(),
            'total_models': len(all_models),
            'models': []
        }

        for model in all_models:
            try:
                model_info = {
                    'app_label': model._meta.app_label,
                    'model_name': model._meta.model_name,
                    'verbose_name': model._meta.verbose_name,
                    'db_table': model._meta.db_table,
                    'fields_count': len(model._meta.fields),
                    'relationships_count': len(model._meta.related_objects),
                }
                
                # Lấy thông tin fields cơ bản
                fields_info = []
                for field in model._meta.fields:
                    field_info = {
                        'name': field.name,
                        'type': field.__class__.__name__,
                        'null': field.null,
                        'blank': field.blank,
                    }
                    fields_info.append(field_info)
                
                model_info['fields'] = fields_info
                
                # Lấy thông tin relationships cơ bản
                relationships_info = []
                for field in model._meta.related_objects:
                    rel_info = {
                        'name': field.name,
                        'type': field.__class__.__name__,
                        'related_model': f"{field.related_model._meta.app_label}.{field.related_model._meta.model_name}",
                    }
                    relationships_info.append(rel_info)
                
                model_info['relationships'] = relationships_info
                models_data['models'].append(model_info)
                
                self.stdout.write(
                    f'✓ Đã export model: {model._meta.app_label}.{model._meta.model_name}'
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ Lỗi khi export model {model._meta.app_label}.{model._meta.model_name}: {e}')
                )
                # Thêm thông tin lỗi vào data
                models_data['models'].append({
                    'app_label': model._meta.app_label,
                    'model_name': model._meta.model_name,
                    'error': str(e)
                })

        # Lưu vào file
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(models_data, f, indent=2, ensure_ascii=False, default=str)

            self.stdout.write(
                self.style.SUCCESS(
                    f'Hoàn thành! Đã export {len(models_data["models"])} models vào file: {output_file}'
                )
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Lỗi khi lưu file: {e}')
            ) 