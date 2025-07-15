from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0007_alter_inventory_created_by_and_more'),
    ]

    operations = [
        # Xóa unique constraint cũ nếu có
        migrations.RunSQL(
            "ALTER TABLE inventory DROP CONSTRAINT IF EXISTS inventory_product_variant_id_store_id_a496cd2a_uniq;",
            reverse_sql="""
                ALTER TABLE inventory ADD CONSTRAINT inventory_product_variant_id_store_id_a496cd2a_uniq
                UNIQUE (product_variant_id, store_id);
            """
        ),
        # Tạo unique index có điều kiện (chỉ với PostgreSQL)
        migrations.RunSQL(
            """
            CREATE UNIQUE INDEX inventory_unique_variant_store_not_deleted
            ON inventory (product_variant_id, store_id)
            WHERE is_deleted = FALSE;
            """,
            reverse_sql="DROP INDEX IF EXISTS inventory_unique_variant_store_not_deleted;"
        ),
    ] 