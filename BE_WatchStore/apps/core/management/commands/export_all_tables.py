from django.core.management.base import BaseCommand
from django.db import connection
import json
from datetime import datetime


class Command(BaseCommand):
    help = 'Export tất cả bảng từ database bao gồm cả through tables và system tables'

    def add_arguments(self, parser):
        parser.add_argument(
            '--output',
            type=str,
            default='all_tables_export.json',
            help='Output file name (default: all_tables_export.json)'
        )
        parser.add_argument(
            '--include-data',
            action='store_true',
            help='Include sample data from database'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=5,
            help='Limit number of records when including data (default: 5)'
        )

    def handle(self, *args, **options):
        output_file = options['output']
        include_data = options['include_data']
        limit = options['limit']

        self.stdout.write(
            self.style.SUCCESS(f'Bắt đầu export tất cả bảng từ cơ sở dữ liệu...')
        )

        # Lấy tất cả bảng từ database
        all_tables = self._get_all_tables()
        
        tables_data = {
            'exported_at': datetime.now().isoformat(),
            'database_info': self._get_database_info(),
            'total_tables': len(all_tables),
            'tables': []
        }

        for table_name in all_tables:
            try:
                table_info = self._get_table_info(table_name, include_data, limit)
                tables_data['tables'].append(table_info)
                
                self.stdout.write(
                    f'✓ Đã export bảng: {table_name}'
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'❌ Lỗi khi export bảng {table_name}: {e}')
                )
                # Thêm thông tin lỗi vào data
                tables_data['tables'].append({
                    'table_name': table_name,
                    'error': str(e)
                })

        # Lưu vào file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(tables_data, f, indent=2, ensure_ascii=False, default=str)

        self.stdout.write(
            self.style.SUCCESS(
                f'Hoàn thành! Đã export {len(tables_data["tables"])} bảng vào file: {output_file}'
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

    def _get_all_tables(self):
        """Lấy tất cả bảng từ database"""
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            """)
            return [row[0] for row in cursor.fetchall()]

    def _get_table_info(self, table_name, include_data=False, limit=5):
        """Lấy thông tin chi tiết của bảng"""
        table_info = {
            'table_name': table_name,
            'columns': [],
            'foreign_keys': [],
            'indexes': [],
            'constraints': []
        }

        # Lấy thông tin columns
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    column_name,
                    data_type,
                    is_nullable,
                    column_default,
                    character_maximum_length,
                    numeric_precision,
                    numeric_scale
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = %s
                ORDER BY ordinal_position
            """, (table_name,))
            
            columns = cursor.fetchall()
            for col in columns:
                column_info = {
                    'name': col[0],
                    'type': col[1],
                    'nullable': col[2] == 'YES',
                    'default': col[3],
                    'max_length': col[4],
                    'precision': col[5],
                    'scale': col[6]
                }
                table_info['columns'].append(column_info)

        # Lấy thông tin foreign keys
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    kcu.column_name,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name,
                    tc.constraint_name
                FROM information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_name = %s
            """, (table_name,))
            
            foreign_keys = cursor.fetchall()
            for fk in foreign_keys:
                fk_info = {
                    'column': fk[0],
                    'foreign_table': fk[1],
                    'foreign_column': fk[2],
                    'constraint_name': fk[3]
                }
                table_info['foreign_keys'].append(fk_info)

        # Lấy thông tin indexes
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    indexname,
                    indexdef
                FROM pg_indexes 
                WHERE tablename = %s
                AND indexname NOT LIKE '%%_pkey'
            """, (table_name,))
            
            indexes = cursor.fetchall()
            for idx in indexes:
                idx_info = {
                    'name': idx[0],
                    'definition': idx[1]
                }
                table_info['indexes'].append(idx_info)

        # Lấy thông tin constraints
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    constraint_name,
                    constraint_type
                FROM information_schema.table_constraints 
                WHERE table_schema = 'public' 
                AND table_name = %s
            """, (table_name,))
            
            constraints = cursor.fetchall()
            for const in constraints:
                const_info = {
                    'name': const[0],
                    'type': const[1]
                }
                table_info['constraints'].append(const_info)

        # Lấy sample data nếu được yêu cầu
        if include_data:
            try:
                with connection.cursor() as cursor:
                    cursor.execute(f"SELECT * FROM {table_name} LIMIT {limit}")
                    columns = [desc[0] for desc in cursor.description]
                    rows = cursor.fetchall()
                    
                    sample_data = []
                    for row in rows:
                        row_data = {}
                        for i, col in enumerate(columns):
                            value = row[i]
                            if hasattr(value, 'isoformat'):  # Xử lý datetime
                                row_data[col] = value.isoformat()
                            else:
                                row_data[col] = value
                        sample_data.append(row_data)
                    
                    table_info['sample_data'] = sample_data
                    
                    # Lấy tổng số records
                    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                    total_count = cursor.fetchone()[0]
                    table_info['total_count'] = total_count
                    
            except Exception as e:
                table_info['sample_data_error'] = str(e)

        return table_info 