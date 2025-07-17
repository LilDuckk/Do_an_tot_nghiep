from django.core.management.base import BaseCommand
from django.db import connection
from django.apps import apps

class Command(BaseCommand):
    help = 'Fix database sequences to match actual data'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Danh sách các model cần fix sequence
            models_to_fix = [
                ('product', 'product_id_seq'),
                ('productvariant', 'productvariant_id_seq'),
                ('category', 'category_id_seq'),
                ('brand', 'brand_id_seq'),
                ('orders', 'orders_id_seq'),
                ('customer', 'customer_id_seq'),
                ('store', 'store_id_seq'),
                ('supplier', 'supplier_id_seq'),
                ('employee', 'employee_id_seq'),
                ('purchase_orders', 'purchase_orders_id_seq'),
                ('purchase_order_details', 'purchase_order_details_id_seq'),
                ('goods_receipts', 'goods_receipts_id_seq'),
                ('goods_receipt_details', 'goods_receipt_details_id_seq'),
                ('inventory', 'inventory_id_seq'),
                ('warranty', 'warranty_id_seq'),
                ('warrantyclaim', 'warrantyclaim_id_seq'),
                ('audit_log', 'audit_log_id_seq'),
                ('variantimage', 'variantimage_id_seq'),
                ('productimage', 'productimage_id_seq'),
                ('useraccount', 'useraccount_id_seq'),
                ('useraccount_groups', 'useraccount_groups_id_seq'),
                ('employee', 'employee_id_seq'),
                ('news', 'news_id_seq'),
                ('auth_group', 'auth_group_id_seq'),
                ('auth_group_permissions', 'auth_group_permissions_id_seq'),
                ('attributetype', 'attributetype_id_seq'),
                ('attributevalue', 'attributevalue_id_seq'),
                ('footerlink', 'footerlink_id_seq'),
                ('footercategory', 'footercategory_id_seq'),
                ('inventorytransaction', 'inventorytransaction_id_seq'),
                ('orderdetail', 'orderdetail_id_seq'),
                ('banner', 'banner_id_seq'),
                ('contactinfo', 'contactinfo_id_seq'),
                ('returnorder', 'returnorder_id_seq'),
                ('returnorderdetail', 'returnorderdetail_id_seq'),
                ('stocktake', 'stocktake_id_seq'),
                ('stocktransfer', 'stocktransfer_id_seq'),
                ('stocktransferdetail', 'stocktransferdetail_id_seq'),
            ]
            
            for table_name, sequence_name in models_to_fix:
                try:
                    # Kiểm tra xem bảng có tồn tại không
                    cursor.execute(f"""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_name = '{table_name}'
                        );
                    """)
                    table_exists = cursor.fetchone()[0]
                    
                    if not table_exists:
                        self.stdout.write(
                            self.style.WARNING(f'Table {table_name} does not exist, skipping...')
                        )
                        continue
                    
                    # Lấy ID lớn nhất từ bảng
                    cursor.execute(f'SELECT MAX(id) FROM {table_name};')
                    max_id = cursor.fetchone()[0]
                    
                    if max_id is None:
                        self.stdout.write(
                            self.style.WARNING(f'Table {table_name} is empty, setting sequence to 1')
                        )
                        cursor.execute(f"SELECT setval('{sequence_name}', 1, false);")
                    else:
                        # Reset sequence về giá trị lớn nhất + 1
                        cursor.execute(f"SELECT setval('{sequence_name}', {max_id}, true);")
                        self.stdout.write(
                            self.style.SUCCESS(f'Fixed {sequence_name}: set to {max_id}')
                        )
                        
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'Error fixing {sequence_name}: {str(e)}')
                    )
            
            self.stdout.write(
                self.style.SUCCESS('Sequence fixing completed!')
            ) 