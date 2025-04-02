from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from decimal import Decimal

# Trang khách hàng
class ProductCategory(models.Model):
    name = models.CharField(max_length=255, verbose_name='Tên danh mục')
    description = models.TextField(blank=True, null=True, verbose_name='Mô tả')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children', verbose_name='Danh mục cha')
    image_url = models.URLField(blank=True, null=True, verbose_name='URL hình ảnh')
    is_active = models.BooleanField(default=True, verbose_name='Đang hoạt động')
    display_order = models.IntegerField(default=0, verbose_name='Thứ tự hiển thị')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_categories', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_categories', verbose_name='Người cập nhật')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        verbose_name = 'Danh mục sản phẩm'
        verbose_name_plural = 'Danh mục sản phẩm'
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name

class Brand(models.Model):
    name = models.CharField(max_length=255, verbose_name='Tên thương hiệu')
    description = models.TextField(blank=True, null=True, verbose_name='Mô tả')
    logo_url = models.URLField(blank=True, null=True, verbose_name='URL logo')
    is_active = models.BooleanField(default=True, verbose_name='Đang hoạt động')
    display_order = models.IntegerField(default=0, verbose_name='Thứ tự hiển thị')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_brands', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_brands', verbose_name='Người cập nhật')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        verbose_name = 'Thương hiệu'
        verbose_name_plural = 'Thương hiệu'
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=255, verbose_name='Tên sản phẩm')
    description = models.TextField(blank=True, null=True, verbose_name='Mô tả')
    category = models.ForeignKey(ProductCategory, on_delete=models.CASCADE, related_name='products', verbose_name='Danh mục')
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='products', verbose_name='Thương hiệu')
    base_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal('0.01'))], verbose_name='Giá cơ bản')
    is_active = models.BooleanField(default=True, verbose_name='Đang hoạt động')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_products', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_products', verbose_name='Người cập nhật')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        verbose_name = 'Sản phẩm'
        verbose_name_plural = 'Sản phẩm'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images', verbose_name='Sản phẩm')
    image_url = models.URLField(verbose_name='URL hình ảnh')
    is_main = models.BooleanField(default=False, verbose_name='Hình ảnh chính')
    display_order = models.IntegerField(default=0, verbose_name='Thứ tự hiển thị')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_product_images', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_product_images', verbose_name='Người cập nhật')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')

    class Meta:
        verbose_name = 'Hình ảnh sản phẩm'
        verbose_name_plural = 'Hình ảnh sản phẩm'
        ordering = ['display_order']

class Customer(models.Model):
    first_name = models.CharField(max_length=100, verbose_name='Tên')
    last_name = models.CharField(max_length=100, verbose_name='Họ')
    email = models.EmailField(unique=True, null=True, blank=True, verbose_name='Email')
    phone = models.CharField(max_length=15, verbose_name='Số điện thoại')
    address = models.TextField(blank=True, null=True, verbose_name='Địa chỉ')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    last_purchase_date = models.DateTimeField(null=True, blank=True, verbose_name='Ngày mua hàng cuối')
    total_purchases = models.IntegerField(default=0, verbose_name='Tổng số lần mua')
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Tổng chi tiêu')
    notes = models.TextField(blank=True, null=True, verbose_name='Ghi chú')
    customer_type = models.CharField(max_length=20, blank=True, null=True, verbose_name='Loại khách hàng')
    birth_date = models.DateField(null=True, blank=True, verbose_name='Ngày sinh')
    gender = models.CharField(max_length=10, blank=True, null=True, verbose_name='Giới tính')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_customers', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_customers', verbose_name='Người cập nhật')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        verbose_name = 'Khách hàng'
        verbose_name_plural = 'Khách hàng'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Chờ xử lý'),
        ('processing', 'Đang xử lý'),
        ('shipped', 'Đã gửi hàng'),
        ('delivered', 'Đã giao hàng'),
        ('cancelled', 'Đã hủy'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders', verbose_name='Khách hàng')
    store = models.ForeignKey('Store', on_delete=models.CASCADE, related_name='orders', verbose_name='Cửa hàng')
    order_date = models.DateTimeField(auto_now_add=True, verbose_name='Ngày đặt hàng')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Tổng tiền')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Trạng thái')
    payment_method = models.CharField(max_length=50, verbose_name='Phương thức thanh toán')
    shipping_address = models.TextField(verbose_name='Địa chỉ giao hàng')
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Phí vận chuyển')
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Số tiền giảm giá')
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Tổng tiền cuối cùng')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_orders', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_orders', verbose_name='Người cập nhật')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        verbose_name = 'Đơn hàng'
        verbose_name_plural = 'Đơn hàng'
        ordering = ['-order_date']

    def __str__(self):
        return f"Đơn hàng #{self.id} - {self.customer}"

class OrderDetail(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='details', verbose_name='Đơn hàng')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='order_details', verbose_name='Sản phẩm')
    quantity = models.IntegerField(validators=[MinValueValidator(1)], verbose_name='Số lượng')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Đơn giá')

    class Meta:
        verbose_name = 'Chi tiết đơn hàng'
        verbose_name_plural = 'Chi tiết đơn hàng'

    def __str__(self):
        return f"{self.order} - {self.product}"

# Trang quản trị
class Store(models.Model):
    name = models.CharField(max_length=255, verbose_name='Tên cửa hàng')
    address = models.TextField(verbose_name='Địa chỉ')
    phone = models.CharField(max_length=15, verbose_name='Số điện thoại')
    store_code = models.CharField(max_length=50, unique=True, verbose_name='Mã cửa hàng')
    store_type = models.CharField(max_length=50, verbose_name='Loại cửa hàng')
    manager = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, related_name='managed_stores', verbose_name='Quản lý')
    is_active = models.BooleanField(default=True, verbose_name='Đang hoạt động')
    opening_date = models.DateField(verbose_name='Ngày khai trương')
    closing_date = models.DateField(null=True, blank=True, verbose_name='Ngày đóng cửa')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_stores', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_stores', verbose_name='Người cập nhật')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        verbose_name = 'Cửa hàng'
        verbose_name_plural = 'Cửa hàng'
        ordering = ['name']

    def __str__(self):
        return self.name

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile', verbose_name='Tài khoản')
    first_name = models.CharField(max_length=100, verbose_name='Tên')
    last_name = models.CharField(max_length=100, verbose_name='Họ')
    email = models.EmailField(unique=True, verbose_name='Email')
    phone = models.CharField(max_length=15, verbose_name='Số điện thoại')
    role = models.CharField(max_length=50, verbose_name='Vai trò')
    hire_date = models.DateField(verbose_name='Ngày tuyển dụng')
    employee_code = models.CharField(max_length=50, unique=True, verbose_name='Mã nhân viên')
    position = models.CharField(max_length=100, verbose_name='Chức vụ')
    department = models.CharField(max_length=100, verbose_name='Phòng ban')
    salary = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Lương')
    is_active = models.BooleanField(default=True, verbose_name='Đang hoạt động')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_employees', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_employees', verbose_name='Người cập nhật')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        verbose_name = 'Nhân viên'
        verbose_name_plural = 'Nhân viên'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Inventory(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='inventories', verbose_name='Cửa hàng')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inventories', verbose_name='Sản phẩm')
    quantity_in_stock = models.IntegerField(default=0, verbose_name='Số lượng trong kho')
    minimum_stock = models.IntegerField(default=0, verbose_name='Số lượng tối thiểu')
    maximum_stock = models.IntegerField(verbose_name='Số lượng tối đa')
    last_restocked_date = models.DateTimeField(auto_now=True, verbose_name='Ngày nhập kho cuối')

    class Meta:
        verbose_name = 'Tồn kho'
        verbose_name_plural = 'Tồn kho'
        unique_together = ['store', 'product']

    def __str__(self):
        return f"{self.store} - {self.product}"

class StockIn(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='stock_ins', verbose_name='Cửa hàng')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_ins', verbose_name='Sản phẩm')
    quantity = models.IntegerField(validators=[MinValueValidator(1)], verbose_name='Số lượng')
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Giá nhập')
    stock_in_date = models.DateField(verbose_name='Ngày nhập kho')
    supplier_name = models.CharField(max_length=255, verbose_name='Tên nhà cung cấp')

    class Meta:
        verbose_name = 'Phiếu nhập kho'
        verbose_name_plural = 'Phiếu nhập kho'
        ordering = ['-stock_in_date']

    def __str__(self):
        return f"Phiếu nhập #{self.id} - {self.store}"

class StockOut(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='stock_outs', verbose_name='Cửa hàng')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_outs', verbose_name='Sản phẩm')
    quantity = models.IntegerField(validators=[MinValueValidator(1)], verbose_name='Số lượng')
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Giá bán')
    stock_out_date = models.DateField(verbose_name='Ngày xuất kho')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='stock_outs', verbose_name='Nhân viên')

    class Meta:
        verbose_name = 'Phiếu xuất kho'
        verbose_name_plural = 'Phiếu xuất kho'
        ordering = ['-stock_out_date']

    def __str__(self):
        return f"Phiếu xuất #{self.id} - {self.store}"

class Revenue(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='revenues', verbose_name='Cửa hàng')
    revenue_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Doanh thu')
    revenue_date = models.DateField(verbose_name='Ngày')

    class Meta:
        verbose_name = 'Doanh thu'
        verbose_name_plural = 'Doanh thu'
        ordering = ['-revenue_date']

    def __str__(self):
        return f"{self.store} - {self.revenue_date}"

class Attribute(models.Model):
    name = models.CharField(max_length=255, verbose_name='Tên thuộc tính')
    description = models.TextField(blank=True, null=True, verbose_name='Mô tả')

    class Meta:
        verbose_name = 'Thuộc tính'
        verbose_name_plural = 'Thuộc tính'

    def __str__(self):
        return self.name

class CategoryAttribute(models.Model):
    category = models.ForeignKey(ProductCategory, on_delete=models.CASCADE, related_name='category_attributes', verbose_name='Danh mục')
    attribute = models.ForeignKey(Attribute, on_delete=models.CASCADE, related_name='category_attributes', verbose_name='Thuộc tính')
    is_required = models.BooleanField(default=False, verbose_name='Bắt buộc')
    affects_price = models.BooleanField(default=False, verbose_name='Ảnh hưởng giá')
    display_order = models.IntegerField(default=0, verbose_name='Thứ tự hiển thị')

    class Meta:
        verbose_name = 'Thuộc tính danh mục'
        verbose_name_plural = 'Thuộc tính danh mục'
        unique_together = ['category', 'attribute']

class AttributeValue(models.Model):
    attribute = models.ForeignKey(Attribute, on_delete=models.CASCADE, related_name='values', verbose_name='Thuộc tính')
    value = models.CharField(max_length=255, verbose_name='Giá trị')

    class Meta:
        verbose_name = 'Giá trị thuộc tính'
        verbose_name_plural = 'Giá trị thuộc tính'

    def __str__(self):
        return f"{self.attribute.name}: {self.value}"

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants', verbose_name='Sản phẩm')
    sku_code = models.CharField(max_length=255, unique=True, verbose_name='Mã SKU')
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Điều chỉnh giá')
    stock = models.IntegerField(default=0, verbose_name='Tồn kho')
    is_active = models.BooleanField(default=True, verbose_name='Đang hoạt động')
    barcode = models.CharField(max_length=50, blank=True, null=True, verbose_name='Mã vạch')
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True, verbose_name='Cân nặng')
    dimensions = models.CharField(max_length=50, blank=True, null=True, verbose_name='Kích thước')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_variants', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_variants', verbose_name='Người cập nhật')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        verbose_name = 'Biến thể sản phẩm'
        verbose_name_plural = 'Biến thể sản phẩm'

    def __str__(self):
        return f"{self.product.name} - {self.sku_code}"

class ProductVariantAttribute(models.Model):
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='variant_attributes', verbose_name='Biến thể')
    attribute_value = models.ForeignKey(AttributeValue, on_delete=models.CASCADE, related_name='variant_attributes', verbose_name='Giá trị thuộc tính')

    class Meta:
        verbose_name = 'Thuộc tính biến thể'
        verbose_name_plural = 'Thuộc tính biến thể'
        unique_together = ['variant', 'attribute_value']

class Shipment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='shipments', verbose_name='Đơn hàng')
    shipping_method = models.CharField(max_length=50, verbose_name='Phương thức vận chuyển')
    tracking_number = models.CharField(max_length=100, blank=True, null=True, verbose_name='Mã vận đơn')
    status = models.CharField(max_length=50, verbose_name='Trạng thái')
    estimated_delivery_date = models.DateField(verbose_name='Ngày giao hàng dự kiến')
    actual_delivery_date = models.DateField(null=True, blank=True, verbose_name='Ngày giao hàng thực tế')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_shipments', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_shipments', verbose_name='Người cập nhật')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        verbose_name = 'Vận chuyển'
        verbose_name_plural = 'Vận chuyển'

    def __str__(self):
        return f"Vận chuyển #{self.id} - {self.order}"

class ProductSpecification(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='specifications', verbose_name='Sản phẩm')
    name = models.CharField(max_length=100, verbose_name='Tên thông số')
    value = models.TextField(verbose_name='Giá trị')
    display_order = models.IntegerField(default=0, verbose_name='Thứ tự hiển thị')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_specifications', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_specifications', verbose_name='Người cập nhật')

    class Meta:
        verbose_name = 'Thông số sản phẩm'
        verbose_name_plural = 'Thông số sản phẩm'
        ordering = ['display_order']

class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', verbose_name='Sản phẩm')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='reviews', verbose_name='Khách hàng')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], verbose_name='Đánh giá')
    comment = models.TextField(verbose_name='Bình luận')
    review_date = models.DateTimeField(auto_now_add=True, verbose_name='Ngày đánh giá')
    is_approved = models.BooleanField(default=False, verbose_name='Đã duyệt')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_reviews', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_reviews', verbose_name='Người cập nhật')

    class Meta:
        verbose_name = 'Đánh giá sản phẩm'
        verbose_name_plural = 'Đánh giá sản phẩm'
        ordering = ['-review_date']

class ProductWishlist(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='wishlist', verbose_name='Khách hàng')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlist', verbose_name='Sản phẩm')
    added_date = models.DateTimeField(auto_now_add=True, verbose_name='Ngày thêm')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_wishlist', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_wishlist', verbose_name='Người cập nhật')

    class Meta:
        verbose_name = 'Danh sách yêu thích'
        verbose_name_plural = 'Danh sách yêu thích'
        unique_together = ['customer', 'product']

class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name='Mã giảm giá')
    discount_type = models.CharField(max_length=20, verbose_name='Loại giảm giá')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Giá trị giảm giá')
    start_date = models.DateField(verbose_name='Ngày bắt đầu')
    end_date = models.DateField(verbose_name='Ngày kết thúc')
    is_active = models.BooleanField(default=True, verbose_name='Đang hoạt động')
    usage_limit = models.IntegerField(verbose_name='Giới hạn sử dụng')
    used_count = models.IntegerField(default=0, verbose_name='Số lần đã sử dụng')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_coupons', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_coupons', verbose_name='Người cập nhật')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        verbose_name = 'Phiếu giảm giá'
        verbose_name_plural = 'Phiếu giảm giá'

    def __str__(self):
        return self.code

class Return(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='returns', verbose_name='Đơn hàng')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='returns', verbose_name='Sản phẩm')
    quantity = models.IntegerField(validators=[MinValueValidator(1)], verbose_name='Số lượng')
    reason = models.TextField(verbose_name='Lý do')
    status = models.CharField(max_length=50, verbose_name='Trạng thái')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_returns', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_returns', verbose_name='Người cập nhật')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        verbose_name = 'Đổi trả'
        verbose_name_plural = 'Đổi trả'

    def __str__(self):
        return f"Đổi trả #{self.id} - {self.order}"

class WarrantyCard(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='warranty_cards', verbose_name='Đơn hàng')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='warranty_cards', verbose_name='Sản phẩm')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='warranty_cards', verbose_name='Khách hàng')
    issue_date = models.DateField(verbose_name='Ngày phát hành')
    expiry_date = models.DateField(verbose_name='Ngày hết hạn')
    status = models.CharField(max_length=50, verbose_name='Trạng thái')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_warranty_cards', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_warranty_cards', verbose_name='Người cập nhật')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Ngày cập nhật')

    class Meta:
        verbose_name = 'Phiếu bảo hành'
        verbose_name_plural = 'Phiếu bảo hành'

    def __str__(self):
        return f"Phiếu bảo hành #{self.id} - {self.product}"

class PriceHistory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='price_history', verbose_name='Sản phẩm')
    old_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Giá cũ')
    new_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Giá mới')
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='price_changes', verbose_name='Người thay đổi')
    changed_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày thay đổi')
    reason = models.TextField(blank=True, null=True, verbose_name='Lý do')

    class Meta:
        verbose_name = 'Lịch sử giá'
        verbose_name_plural = 'Lịch sử giá'
        ordering = ['-changed_at']

    def __str__(self):
        return f"{self.product.name} - {self.old_price} -> {self.new_price}"

class Notification(models.Model):
    title = models.CharField(max_length=255, verbose_name='Tiêu đề')
    content = models.TextField(verbose_name='Nội dung')
    type = models.CharField(max_length=50, verbose_name='Loại thông báo')
    is_read = models.BooleanField(default=False, verbose_name='Đã đọc')
    expiry_date = models.DateTimeField(null=True, blank=True, verbose_name='Ngày hết hạn')
    is_active = models.BooleanField(default=True, verbose_name='Đang hoạt động')
    is_deleted = models.BooleanField(default=False, verbose_name='Đã xóa')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_notifications', verbose_name='Người tạo')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_notifications', verbose_name='Người cập nhật')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Ngày tạo')

    class Meta:
        verbose_name = 'Thông báo'
        verbose_name_plural = 'Thông báo'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class LoginHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='login_history', verbose_name='Người dùng')
    login_time = models.DateTimeField(auto_now_add=True, verbose_name='Thời gian đăng nhập')
    ip_address = models.GenericIPAddressField(verbose_name='Địa chỉ IP')
    device_info = models.TextField(verbose_name='Thông tin thiết bị')
    status = models.CharField(max_length=20, verbose_name='Trạng thái')

    class Meta:
        verbose_name = 'Lịch sử đăng nhập'
        verbose_name_plural = 'Lịch sử đăng nhập'
        ordering = ['-login_time']

    def __str__(self):
        return f"{self.user.username} - {self.login_time}"
