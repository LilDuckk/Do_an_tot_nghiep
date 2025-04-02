from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings
import django.utils.timezone
import django.core.validators
from decimal import Decimal


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='Tên vai trò')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Mô tả')),
            ],
            options={
                'verbose_name': 'Vai trò',
                'verbose_name_plural': 'Vai trò',
            },
        ),
        migrations.CreateModel(
            name='Permission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='Tên quyền')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Mô tả')),
            ],
            options={
                'verbose_name': 'Quyền',
                'verbose_name_plural': 'Quyền',
            },
        ),
        migrations.CreateModel(
            name='RolePermission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='products.permission', verbose_name='Quyền')),
                ('role', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='products.role', verbose_name='Vai trò')),
            ],
            options={
                'verbose_name': 'Phân quyền',
                'verbose_name_plural': 'Phân quyền',
            },
        ),
        migrations.CreateModel(
            name='ProductCategory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Tên danh mục')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Mô tả')),
                ('image_url', models.URLField(blank=True, null=True, verbose_name='URL hình ảnh')),
                ('is_active', models.BooleanField(default=True, verbose_name='Đang hoạt động')),
                ('display_order', models.IntegerField(default=0, verbose_name='Thứ tự hiển thị')),
                ('is_deleted', models.BooleanField(default=False, verbose_name='Đã xóa')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_categories', to=settings.AUTH_USER_MODEL, verbose_name='Người tạo')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='products.productcategory', verbose_name='Danh mục cha')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_categories', to=settings.AUTH_USER_MODEL, verbose_name='Người cập nhật')),
            ],
            options={
                'verbose_name': 'Danh mục sản phẩm',
                'verbose_name_plural': 'Danh mục sản phẩm',
                'ordering': ['display_order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='Brand',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Tên thương hiệu')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Mô tả')),
                ('logo_url', models.URLField(blank=True, null=True, verbose_name='URL logo')),
                ('is_active', models.BooleanField(default=True, verbose_name='Đang hoạt động')),
                ('display_order', models.IntegerField(default=0, verbose_name='Thứ tự hiển thị')),
                ('is_deleted', models.BooleanField(default=False, verbose_name='Đã xóa')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_brands', to=settings.AUTH_USER_MODEL, verbose_name='Người tạo')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_brands', to=settings.AUTH_USER_MODEL, verbose_name='Người cập nhật')),
            ],
            options={
                'verbose_name': 'Thương hiệu',
                'verbose_name_plural': 'Thương hiệu',
                'ordering': ['display_order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Tên sản phẩm')),
                ('description', models.TextField(blank=True, null=True, verbose_name='Mô tả')),
                ('base_price', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0.01'))], verbose_name='Giá cơ bản')),
                ('is_active', models.BooleanField(default=True, verbose_name='Đang hoạt động')),
                ('is_deleted', models.BooleanField(default=False, verbose_name='Đã xóa')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')),
                ('brand', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='products', to='products.brand', verbose_name='Thương hiệu')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='products', to='products.productcategory', verbose_name='Danh mục')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_products', to=settings.AUTH_USER_MODEL, verbose_name='Người tạo')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_products', to=settings.AUTH_USER_MODEL, verbose_name='Người cập nhật')),
            ],
            options={
                'verbose_name': 'Sản phẩm',
                'verbose_name_plural': 'Sản phẩm',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Employee',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=100, verbose_name='Tên')),
                ('last_name', models.CharField(max_length=100, verbose_name='Họ')),
                ('email', models.EmailField(max_length=254, unique=True, verbose_name='Email')),
                ('phone', models.CharField(max_length=15, verbose_name='Số điện thoại')),
                ('role', models.CharField(max_length=50, verbose_name='Vai trò')),
                ('hire_date', models.DateField(verbose_name='Ngày tuyển dụng')),
                ('employee_code', models.CharField(max_length=50, unique=True, verbose_name='Mã nhân viên')),
                ('position', models.CharField(max_length=100, verbose_name='Chức vụ')),
                ('department', models.CharField(max_length=100, verbose_name='Phòng ban')),
                ('salary', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Lương')),
                ('is_active', models.BooleanField(default=True, verbose_name='Đang hoạt động')),
                ('is_deleted', models.BooleanField(default=False, verbose_name='Đã xóa')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_employees', to=settings.AUTH_USER_MODEL, verbose_name='Người tạo')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_employees', to=settings.AUTH_USER_MODEL, verbose_name='Người cập nhật')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='employee_profile', to=settings.AUTH_USER_MODEL, verbose_name='Tài khoản')),
            ],
            options={
                'verbose_name': 'Nhân viên',
                'verbose_name_plural': 'Nhân viên',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Store',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='Tên cửa hàng')),
                ('address', models.TextField(verbose_name='Địa chỉ')),
                ('phone', models.CharField(max_length=15, verbose_name='Số điện thoại')),
                ('store_code', models.CharField(max_length=50, unique=True, verbose_name='Mã cửa hàng')),
                ('store_type', models.CharField(max_length=50, verbose_name='Loại cửa hàng')),
                ('is_active', models.BooleanField(default=True, verbose_name='Đang hoạt động')),
                ('opening_date', models.DateField(verbose_name='Ngày khai trương')),
                ('closing_date', models.DateField(blank=True, null=True, verbose_name='Ngày đóng cửa')),
                ('is_deleted', models.BooleanField(default=False, verbose_name='Đã xóa')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_stores', to=settings.AUTH_USER_MODEL, verbose_name='Người tạo')),
                ('manager', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='managed_stores', to='products.employee', verbose_name='Quản lý')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_stores', to=settings.AUTH_USER_MODEL, verbose_name='Người cập nhật')),
            ],
            options={
                'verbose_name': 'Cửa hàng',
                'verbose_name_plural': 'Cửa hàng',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Customer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=100, verbose_name='Tên')),
                ('last_name', models.CharField(max_length=100, verbose_name='Họ')),
                ('email', models.EmailField(blank=True, max_length=254, null=True, unique=True, verbose_name='Email')),
                ('phone', models.CharField(max_length=15, verbose_name='Số điện thoại')),
                ('address', models.TextField(blank=True, null=True, verbose_name='Địa chỉ')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')),
                ('last_purchase_date', models.DateTimeField(blank=True, null=True, verbose_name='Ngày mua hàng cuối')),
                ('total_purchases', models.IntegerField(default=0, verbose_name='Tổng số lần mua')),
                ('total_spent', models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name='Tổng chi tiêu')),
                ('notes', models.TextField(blank=True, null=True, verbose_name='Ghi chú')),
                ('customer_type', models.CharField(blank=True, max_length=20, null=True, verbose_name='Loại khách hàng')),
                ('birth_date', models.DateField(blank=True, null=True, verbose_name='Ngày sinh')),
                ('gender', models.CharField(blank=True, max_length=10, null=True, verbose_name='Giới tính')),
                ('is_deleted', models.BooleanField(default=False, verbose_name='Đã xóa')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_customers', to=settings.AUTH_USER_MODEL, verbose_name='Người tạo')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_customers', to=settings.AUTH_USER_MODEL, verbose_name='Người cập nhật')),
            ],
            options={
                'verbose_name': 'Khách hàng',
                'verbose_name_plural': 'Khách hàng',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order_date', models.DateTimeField(auto_now_add=True, verbose_name='Ngày đặt hàng')),
                ('total_amount', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Tổng tiền')),
                ('status', models.CharField(choices=[('pending', 'Chờ xử lý'), ('processing', 'Đang xử lý'), ('shipped', 'Đã gửi hàng'), ('delivered', 'Đã giao hàng'), ('cancelled', 'Đã hủy')], default='pending', max_length=20, verbose_name='Trạng thái')),
                ('payment_method', models.CharField(max_length=50, verbose_name='Phương thức thanh toán')),
                ('shipping_address', models.TextField(verbose_name='Địa chỉ giao hàng')),
                ('shipping_fee', models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name='Phí vận chuyển')),
                ('discount_amount', models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name='Số tiền giảm giá')),
                ('final_amount', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Tổng tiền cuối cùng')),
                ('is_deleted', models.BooleanField(default=False, verbose_name='Đã xóa')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_orders', to=settings.AUTH_USER_MODEL, verbose_name='Người tạo')),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='orders', to='products.customer', verbose_name='Khách hàng')),
                ('store', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='orders', to='products.store', verbose_name='Cửa hàng')),
                ('updated_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_orders', to=settings.AUTH_USER_MODEL, verbose_name='Người cập nhật')),
            ],
            options={
                'verbose_name': 'Đơn hàng',
                'verbose_name_plural': 'Đơn hàng',
                'ordering': ['-order_date'],
            },
        ),
        migrations.CreateModel(
            name='OrderDetail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.IntegerField(validators=[django.core.validators.MinValueValidator(1)], verbose_name='Số lượng')),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Đơn giá')),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='details', to='products.order', verbose_name='Đơn hàng')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='order_details', to='products.product', verbose_name='Sản phẩm')),
            ],
            options={
                'verbose_name': 'Chi tiết đơn hàng',
                'verbose_name_plural': 'Chi tiết đơn hàng',
            },
        ),
    ] 