from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import connection
import os
from datetime import datetime


class Command(BaseCommand):
    help = 'Generate Python models code from database structure'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            default='generated_models.py',
            help='Output file name (default: generated_models.py)'
        )
        parser.add_argument(
            '--app',
            type=str,
            help='Generate only specific app models'
        )
        parser.add_argument(
            '--model',
            type=str,
            help='Generate only specific model'
        )
        parser.add_argument(
            '--include-meta',
            action='store_true',
            help='Include Meta class information'
        )

    def handle(self, *args, **options):
        output_file = options['output']
        app_name = options['app']
        model_name = options['model']
        include_meta = options['include_meta']

        self.stdout.write(
            self.style.SUCCESS(f'Bắt đầu generate models code từ cơ sở dữ liệu...')
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

        # Tạo Python code
        python_code = self._generate_python_code(all_models, include_meta)

        # Lưu vào file
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(python_code)

        self.stdout.write(
            self.style.SUCCESS(
                f'Hoàn thành! Đã generate {len(all_models)} models vào file: {output_file}'
            )
        )

    def _generate_python_code(self, models, include_meta=False):
        """Generate Python code cho models"""
        code_lines = [
            "# Generated models from database",
            f"# Generated at: {datetime.now().isoformat()}",
            "# This file contains Django models generated from existing database structure",
            "",
            "from django.db import models",
            "from django.contrib.auth.models import AbstractUser",
            "from django.utils import timezone",
            "",
            ""
        ]

        # Nhóm models theo app
        models_by_app = {}
        for model in models:
            app_label = model._meta.app_label
            if app_label not in models_by_app:
                models_by_app[app_label] = []
            models_by_app[app_label].append(model)

        # Generate code cho từng app
        for app_label, app_models in models_by_app.items():
            code_lines.append(f"# App: {app_label}")
            code_lines.append("")
            
            for model in app_models:
                model_code = self._generate_model_code(model, include_meta)
                code_lines.extend(model_code)
                code_lines.append("")
                code_lines.append("")

        return "\n".join(code_lines)

    def _generate_model_code(self, model, include_meta=False):
        """Generate Python code cho một model cụ thể"""
        code_lines = []
        
        # Class definition
        class_name = model._meta.model_name
        code_lines.append(f"class {class_name.capitalize()}(models.Model):")
        
        # Fields
        for field in model._meta.fields:
            field_code = self._generate_field_code(field)
            code_lines.append(f"    {field_code}")
        
        # Relationships
        for field in model._meta.related_objects:
            rel_code = self._generate_relationship_code(field)
            code_lines.append(f"    {rel_code}")
        
        # Meta class
        if include_meta:
            meta_code = self._generate_meta_code(model)
            if meta_code:
                code_lines.append("")
                code_lines.extend(meta_code)
        
        # __str__ method
        code_lines.append("")
        code_lines.append("    def __str__(self):")
        
        # Tìm field phù hợp cho __str__
        str_field = self._find_str_field(model)
        if str_field:
            code_lines.append(f"        return str(self.{str_field})")
        else:
            code_lines.append(f"        return f'{class_name} #{{self.id}}'")
        
        return code_lines

    def _generate_field_code(self, field):
        """Generate code cho một field"""
        field_name = field.name
        field_type = self._get_field_type(field)
        
        # Base field definition
        field_code = f"{field_name} = {field_type}"
        
        # Add parameters
        params = []
        
        if hasattr(field, 'max_length') and field.max_length:
            params.append(f"max_length={field.max_length}")
        
        if field.null:
            params.append("null=True")
        
        if field.blank:
            params.append("blank=True")
        
        if field.default is not None and not callable(field.default):
            if isinstance(field.default, str):
                params.append(f"default='{field.default}'")
            else:
                params.append(f"default={field.default}")
        
        if hasattr(field, 'choices') and field.choices:
            choices_str = self._format_choices(field.choices)
            params.append(f"choices={choices_str}")
        
        if hasattr(field, 'help_text') and field.help_text:
            params.append(f"help_text='{field.help_text}'")
        
        if hasattr(field, 'verbose_name') and field.verbose_name:
            params.append(f"verbose_name='{field.verbose_name}'")
        
        # Add parameters to field definition
        if params:
            field_code += f"({', '.join(params)})"
        
        return field_code

    def _generate_relationship_code(self, field):
        """Generate code cho relationship fields"""
        field_name = field.name
        related_model = field.related_model._meta.model_name.capitalize()
        
        if hasattr(field, 'remote_field'):
            if hasattr(field.remote_field, 'multiple') and field.remote_field.multiple:
                # ManyToMany or OneToMany
                if hasattr(field, 'through'):
                    return f"{field_name} = models.ManyToManyField('{related_model}', through='{field.through._meta.model_name}')"
                else:
                    return f"{field_name} = models.ManyToManyField('{related_model}')"
            else:
                # ForeignKey
                params = [f"'{related_model}'"]
                if hasattr(field.remote_field, 'on_delete'):
                    params.append(f"on_delete=models.{field.remote_field.on_delete.__name__}")
                if hasattr(field, 'related_name') and field.related_name:
                    params.append(f"related_name='{field.related_name}'")
                
                return f"{field_name} = models.ForeignKey({', '.join(params)})"
        
        return f"{field_name} = models.ForeignKey('{related_model}')"

    def _generate_meta_code(self, model):
        """Generate Meta class code"""
        meta_lines = []
        meta_lines.append("    class Meta:")
        
        if hasattr(model._meta, 'verbose_name') and model._meta.verbose_name:
            meta_lines.append(f"        verbose_name = '{model._meta.verbose_name}'")
        
        if hasattr(model._meta, 'verbose_name_plural') and model._meta.verbose_name_plural:
            meta_lines.append(f"        verbose_name_plural = '{model._meta.verbose_name_plural}'")
        
        if hasattr(model._meta, 'db_table') and model._meta.db_table:
            meta_lines.append(f"        db_table = '{model._meta.db_table}'")
        
        if hasattr(model._meta, 'unique_together') and model._meta.unique_together:
            unique_together = str(model._meta.unique_together)
            meta_lines.append(f"        unique_together = {unique_together}")
        
        if hasattr(model._meta, 'indexes') and model._meta.indexes:
            indexes = []
            for index in model._meta.indexes:
                index_str = f"models.Index(fields={list(index.fields)}"
                if index.name:
                    index_str += f", name='{index.name}'"
                index_str += ")"
                indexes.append(index_str)
            meta_lines.append(f"        indexes = [{', '.join(indexes)}]")
        
        return meta_lines if len(meta_lines) > 1 else []

    def _get_field_type(self, field):
        """Lấy tên field type"""
        field_type = field.__class__.__name__
        
        # Map field types
        type_mapping = {
            'AutoField': 'models.AutoField',
            'BigAutoField': 'models.BigAutoField',
            'CharField': 'models.CharField',
            'TextField': 'models.TextField',
            'IntegerField': 'models.IntegerField',
            'BigIntegerField': 'models.BigIntegerField',
            'DecimalField': 'models.DecimalField',
            'FloatField': 'models.FloatField',
            'BooleanField': 'models.BooleanField',
            'DateTimeField': 'models.DateTimeField',
            'DateField': 'models.DateField',
            'TimeField': 'models.TimeField',
            'EmailField': 'models.EmailField',
            'URLField': 'models.URLField',
            'FileField': 'models.FileField',
            'ImageField': 'models.ImageField',
            'JSONField': 'models.JSONField',
            'UUIDField': 'models.UUIDField',
        }
        
        return type_mapping.get(field_type, f'models.{field_type}')

    def _format_choices(self, choices):
        """Format choices cho field"""
        if not choices:
            return "[]"
        
        choice_list = []
        for choice in choices:
            if isinstance(choice, (list, tuple)) and len(choice) == 2:
                choice_list.append(f"('{choice[0]}', '{choice[1]}')")
        
        return f"[{', '.join(choice_list)}]"

    def _find_str_field(self, model):
        """Tìm field phù hợp cho __str__ method"""
        # Ưu tiên các field có tên phổ biến
        preferred_fields = ['name', 'title', 'code', 'sku', 'email', 'username']
        
        for field_name in preferred_fields:
            if hasattr(model, field_name):
                return field_name
        
        # Tìm field CharField đầu tiên
        for field in model._meta.fields:
            if field.__class__.__name__ == 'CharField' and field.name != 'id':
                return field.name
        
        return None 