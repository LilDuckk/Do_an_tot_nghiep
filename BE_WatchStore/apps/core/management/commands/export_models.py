from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import connection
import json
import os
from datetime import datetime


class Command(BaseCommand):
    help = 'Export models structure from database to JSON file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            default='models_export.json',
            help='Output file name (default: models_export.json)'
        )
        parser.add_argument(
            '--app',
            type=str,
            help='Export only specific app models'
        )
        parser.add_argument(
            '--model',
            type=str,
            help='Export only specific model'
        )
        parser.add_argument(
            '--include-data',
            action='store_true',
            help='Include sample data from database'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=10,
            help='Limit number of records when including data (default: 10)'
        )

    def handle(self, *args, **options):
        output_file = options['output']
        app_name = options['app']
        model_name = options['model']
        include_data = options['include_data']
        limit = options['limit']

        self.stdout.write(
            self.style.SUCCESS(f'Bắt đầu export models từ cơ sở dữ liệu...')
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

        # Lọc theo model nếu được chỉ định
        if model_name:
            all_models = [model for model in all_models if model._meta.model_name == model_name]
            if not all_models:
                self.stdout.write(
                    self.style.ERROR(f'Không tìm thấy model "{model_name}"')
                )
                return

        models_data = {
            'exported_at': datetime.now().isoformat(),
            'database_info': self._get_database_info(),
            'models': []
        }

        for model in all_models:
            model_info = self._get_model_info(model, include_data, limit)
            models_data['models'].append(model_info)
            
            self.stdout.write(
                f'✓ Đã export model: {model._meta.app_label}.{model._meta.model_name}'
            )

        # Lưu vào file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(models_data, f, indent=2, ensure_ascii=False, default=str)

        self.stdout.write(
            self.style.SUCCESS(
                f'Hoàn thành! Đã export {len(models_data["models"])} models vào file: {output_file}'
            )
        )

    def _get_database_info(self):
        """Lấy thông tin cơ sở dữ liệu"""
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            
        return {
            'engine': connection.settings_dict['ENGINE'],
            'name': connection.settings_dict['NAME'],
            'host': connection.settings_dict['HOST'],
            'port': connection.settings_dict['PORT'],
            'version': version
        }

    def _get_model_info(self, model, include_data=False, limit=10):
        """Lấy thông tin chi tiết của model"""
        model_info = {
            'app_label': model._meta.app_label,
            'model_name': model._meta.model_name,
            'verbose_name': model._meta.verbose_name,
            'verbose_name_plural': model._meta.verbose_name_plural,
            'db_table': model._meta.db_table,
            'fields': [],
            'meta': {},
            'relationships': []
        }

        # Lấy thông tin fields
        for field in model._meta.fields:
            field_info = {
                'name': field.name,
                'type': field.__class__.__name__,
                'verbose_name': getattr(field, 'verbose_name', ''),
                'null': field.null,
                'blank': field.blank,
                'default': field.default,
                'max_length': getattr(field, 'max_length', None),
                'choices': getattr(field, 'choices', None),
                'help_text': getattr(field, 'help_text', ''),
            }
            
            # Xử lý default value
            if callable(field.default):
                field_info['default'] = str(field.default)
            
            model_info['fields'].append(field_info)

        # Lấy thông tin relationships
        for field in model._meta.related_objects:
            rel_info = {
                'name': field.name,
                'type': field.__class__.__name__,
                'related_model': f"{field.related_model._meta.app_label}.{field.related_model._meta.model_name}",
                'related_name': getattr(field, 'related_name', None),
            }
            
            # Xử lý on_delete cho ForeignKey
            if hasattr(field, 'remote_field') and hasattr(field.remote_field, 'on_delete'):
                rel_info['on_delete'] = str(field.remote_field.on_delete)
            
            model_info['relationships'].append(rel_info)
        
        # Lấy thông tin ManyToMany fields và through tables
        for field in model._meta.many_to_many:
            m2m_info = {
                'name': field.name,
                'type': 'ManyToManyField',
                'related_model': f"{field.related_model._meta.app_label}.{field.related_model._meta.model_name}",
                'related_name': getattr(field, 'related_name', None),
            }
            
            # Thêm thông tin through table nếu có
            if hasattr(field, 'through') and field.through:
                m2m_info['through_table'] = field.through._meta.db_table
                m2m_info['through_model'] = f"{field.through._meta.app_label}.{field.through._meta.model_name}"
            
            model_info['relationships'].append(m2m_info)

        # Lấy thông tin Meta
        if hasattr(model._meta, 'unique_together') and model._meta.unique_together:
            model_info['meta']['unique_together'] = model._meta.unique_together
        
        if hasattr(model._meta, 'indexes') and model._meta.indexes:
            model_info['meta']['indexes'] = [
                {
                    'name': index.name,
                    'fields': index.fields,
                    'condition': str(index.condition) if index.condition else None
                }
                for index in model._meta.indexes
            ]

        # Lấy sample data nếu được yêu cầu
        if include_data:
            try:
                sample_data = []
                queryset = model.objects.all()[:limit]
                
                for obj in queryset:
                    obj_data = {}
                    for field in model._meta.fields:
                        value = getattr(obj, field.name)
                        if hasattr(value, 'isoformat'):  # Xử lý datetime
                            obj_data[field.name] = value.isoformat()
                        else:
                            obj_data[field.name] = value
                    sample_data.append(obj_data)
                
                model_info['sample_data'] = sample_data
                model_info['total_count'] = model.objects.count()
                
            except Exception as e:
                model_info['sample_data_error'] = str(e)

        return model_info 