from django.db import models


class Attributetype(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'attributetype'


class Attributevalue(models.Model):
    attribute_type = models.ForeignKey(Attributetype, models.DO_NOTHING, blank=True, null=True)
    value = models.CharField(max_length=255)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'attributevalue'
    old_values = models.JSONField(blank=True, null=True)
    new_values = models.JSONField(blank=True, null=True)
    ip_address = models.CharField(max_length=50, blank=True, null=True)
    action_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'auditlog'


class Banner(models.Model):
    title = models.CharField(max_length=255)
    image_url = models.CharField(max_length=255)
    link_url = models.CharField(max_length=255, blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    display_order = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    banner_location = models.CharField(max_length=50)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='banner_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'banner'


class Brand(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    logo_url = models.CharField(max_length=255, blank=True, null=True)
    display_order = models.IntegerField(blank=True, null=True)
    slug = models.CharField(unique=True, max_length=255, blank=True, null=True)
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='brand_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'brand'


class Category(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    parent = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)
    display_order = models.IntegerField(blank=True, null=True)
    slug = models.CharField(unique=True, max_length=255, blank=True, null=True)
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='category_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'category'


class Contactinfo(models.Model):
    company_name = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    working_hours = models.TextField(blank=True, null=True)
    facebook_url = models.CharField(max_length=255, blank=True, null=True)
    instagram_url = models.CharField(max_length=255, blank=True, null=True)
    youtube_url = models.CharField(max_length=255, blank=True, null=True)
    tiktok_url = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='contactinfo_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'contactinfo'


class Coupon(models.Model):
    code = models.CharField(unique=True, max_length=50)
    description = models.TextField(blank=True, null=True)
    discount_type = models.CharField(max_length=20, blank=True, null=True)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_order_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)   
    starts_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    usage_limit = models.IntegerField(blank=True, null=True)
    usage_count = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='coupon_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'coupon'


class Customer(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', related_name='customer_created_by_set', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='customer_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'customer'


class Employee(models.Model):
    user = models.ForeignKey('Useraccount', models.DO_NOTHING, blank=True, null=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    employee_code = models.CharField(unique=True, max_length=50, blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    hire_date = models.DateField(blank=True, null=True)
    store = models.ForeignKey('Store', models.DO_NOTHING, blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'employee'


class Footercategory(models.Model):
    name = models.CharField(max_length=100)
    display_order = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='footercategory_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'footercategory'


class Footerlink(models.Model):
    category = models.ForeignKey(Footercategory, models.DO_NOTHING, blank=True, null=True)
    title = models.CharField(max_length=255)
    url = models.CharField(max_length=255)
    display_order = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='footerlink_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'footerlink'


class Inventory(models.Model):
    product_variant = models.ForeignKey('Productvariant', models.DO_NOTHING, blank=True, null=True)      
    store = models.ForeignKey('Store', models.DO_NOTHING, blank=True, null=True)
    quantity = models.IntegerField(blank=True, null=True)
    last_updated = models.DateTimeField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'inventory'
        unique_together = (('product_variant', 'store'),)


class Inventorytransaction(models.Model):
    inventory = models.ForeignKey(Inventory, models.DO_NOTHING, blank=True, null=True)
    transaction_type = models.CharField(max_length=20)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    reference_id = models.IntegerField(blank=True, null=True)
    reference_type = models.CharField(max_length=50, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    transaction_date = models.DateTimeField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='inventorytransaction_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'inventorytransaction'


class News(models.Model):
    title = models.CharField(max_length=255)
    slug = models.CharField(unique=True, max_length=255)
    content = models.TextField(blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    category = models.ForeignKey('Newscategory', models.DO_NOTHING, blank=True, null=True)
    featured_image = models.CharField(max_length=255, blank=True, null=True)
    is_published = models.BooleanField(blank=True, null=True)
    publish_date = models.DateTimeField(blank=True, null=True)
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    view_count = models.IntegerField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='news_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'news'


class Newscategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.CharField(unique=True, max_length=150)
    description = models.TextField(blank=True, null=True)
    display_order = models.IntegerField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='newscategory_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'newscategory'


class Ordercoupon(models.Model):
    order = models.ForeignKey('Orders', models.DO_NOTHING, blank=True, null=True)
    coupon = models.ForeignKey(Coupon, models.DO_NOTHING, blank=True, null=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'ordercoupon'


class Orderdetail(models.Model):
    order = models.ForeignKey('Orders', models.DO_NOTHING, blank=True, null=True)
    product_variant = models.ForeignKey('Productvariant', models.DO_NOTHING, blank=True, null=True)      
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'orderdetail'


class Orders(models.Model):
    customer = models.ForeignKey(Customer, models.DO_NOTHING, blank=True, null=True)
    store = models.ForeignKey('Store', models.DO_NOTHING, blank=True, null=True)
    employee = models.ForeignKey(Employee, models.DO_NOTHING, blank=True, null=True)
    order_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    payment_status = models.CharField(max_length=50, blank=True, null=True)
    shipping_address = models.TextField(blank=True, null=True)
    shipping_method = models.CharField(max_length=100, blank=True, null=True)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    discount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.TextField(blank=True, null=True)
    is_online_order = models.BooleanField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='orders_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'orders'


class Permission(models.Model):
    name = models.CharField(max_length=50)
    code = models.CharField(unique=True, max_length=100)
    description = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'permission'


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, models.DO_NOTHING, blank=True, null=True)
    brand = models.ForeignKey(Brand, models.DO_NOTHING, blank=True, null=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    warranty_period = models.IntegerField(blank=True, null=True)
    slug = models.CharField(unique=True, max_length=255, blank=True, null=True)
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    is_featured = models.BooleanField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='product_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'product'


class Productimage(models.Model):
    product = models.ForeignKey(Product, models.DO_NOTHING, blank=True, null=True)
    product_variant = models.ForeignKey('Productvariant', models.DO_NOTHING, blank=True, null=True)      
    image_url = models.CharField(max_length=255)
    is_primary = models.BooleanField(blank=True, null=True)
    alt_text = models.CharField(max_length=255, blank=True, null=True)
    display_order = models.IntegerField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='productimage_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'productimage'


class Productvariant(models.Model):
    product = models.ForeignKey(Product, models.DO_NOTHING, blank=True, null=True)
    sku = models.CharField(unique=True, max_length=100)
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)       
    stock_alert_threshold = models.IntegerField(blank=True, null=True)
    barcode = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='productvariant_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'productvariant'


class Productvariantattribute(models.Model):
    product_variant = models.ForeignKey(Productvariant, models.DO_NOTHING, blank=True, null=True)        
    attribute_value = models.ForeignKey(Attributevalue, models.DO_NOTHING, blank=True, null=True)        
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'productvariantattribute'
        unique_together = (('product_variant', 'attribute_value'),)


class Purchaseorder(models.Model):
    supplier = models.ForeignKey('Supplier', models.DO_NOTHING, blank=True, null=True)
    store = models.ForeignKey('Store', models.DO_NOTHING, blank=True, null=True)
    order_date = models.DateTimeField(blank=True, null=True)
    expected_delivery_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='purchaseorder_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'purchaseorder'


class Purchaseorderdetail(models.Model):
    purchase_order = models.ForeignKey(Purchaseorder, models.DO_NOTHING, blank=True, null=True)
    product_variant = models.ForeignKey(Productvariant, models.DO_NOTHING, blank=True, null=True)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    received_quantity = models.IntegerField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'purchaseorderdetail'


class Returnorder(models.Model):
    order = models.ForeignKey(Orders, models.DO_NOTHING, blank=True, null=True)
    customer = models.ForeignKey(Customer, models.DO_NOTHING, blank=True, null=True)
    return_date = models.DateTimeField(blank=True, null=True)
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    refund_method = models.CharField(max_length=50, blank=True, null=True)
    refund_status = models.CharField(max_length=50, blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='returnorder_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'returnorder'


class Returnorderdetail(models.Model):
    return_order = models.ForeignKey(Returnorder, models.DO_NOTHING, blank=True, null=True)
    order_detail = models.ForeignKey(Orderdetail, models.DO_NOTHING, blank=True, null=True)
    product_variant = models.ForeignKey(Productvariant, models.DO_NOTHING, blank=True, null=True)
    quantity = models.IntegerField()
    reason = models.TextField(blank=True, null=True)
    condition = models.CharField(max_length=50, blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'returnorderdetail'


class Role(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'role'


class Rolepermission(models.Model):
    role = models.ForeignKey(Role, models.DO_NOTHING, blank=True, null=True)
    permission = models.ForeignKey(Permission, models.DO_NOTHING, blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'rolepermission'
        unique_together = (('role', 'permission'),)


class Stocktake(models.Model):
    store = models.ForeignKey('Store', models.DO_NOTHING, blank=True, null=True)
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='stocktake_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'stocktake'


class Stocktakedetail(models.Model):
    stock_take = models.ForeignKey(Stocktake, models.DO_NOTHING, blank=True, null=True)
    product_variant = models.ForeignKey(Productvariant, models.DO_NOTHING, blank=True, null=True)        
    expected_quantity = models.IntegerField(blank=True, null=True)
    actual_quantity = models.IntegerField(blank=True, null=True)
    discrepancy = models.IntegerField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'stocktakedetail'


class Stocktransfer(models.Model):
    source_store = models.ForeignKey('Store', models.DO_NOTHING, blank=True, null=True)
    destination_store = models.ForeignKey('Store', models.DO_NOTHING, related_name='stocktransfer_destination_store_set', blank=True, null=True)
    transfer_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='stocktransfer_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'stocktransfer'


class Stocktransferdetail(models.Model):
    stock_transfer = models.ForeignKey(Stocktransfer, models.DO_NOTHING, blank=True, null=True)
    product_variant = models.ForeignKey(Productvariant, models.DO_NOTHING, blank=True, null=True)
    quantity = models.IntegerField()
    received_quantity = models.IntegerField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'stocktransferdetail'


class Store(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    store_code = models.CharField(unique=True, max_length=50)
    opening_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='store_updated_by_set', blank=True, null=True)
    manager = models.ForeignKey(Employee, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'store'


class Supplier(models.Model):
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=100, blank=True, null=True)
    email = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    tax_code = models.CharField(max_length=50, blank=True, null=True)
    website = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey('Useraccount', models.DO_NOTHING, db_column='updated_by', related_name='supplier_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'supplier'


class Useraccount(models.Model):
    username = models.CharField(unique=True, max_length=100)
    password = models.CharField(max_length=255)
    email = models.CharField(unique=True, max_length=255, blank=True, null=True)
    role = models.ForeignKey(Role, models.DO_NOTHING, blank=True, null=True)
    last_login = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    failed_login_attempts = models.IntegerField(blank=True, null=True)
    account_locked_until = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'useraccount'


class Warranty(models.Model):
    order_detail = models.ForeignKey(Orderdetail, models.DO_NOTHING, blank=True, null=True)
    warranty_start_date = models.DateField()
    warranty_end_date = models.DateField()
    serial_number = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(Useraccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(Useraccount, models.DO_NOTHING, db_column='updated_by', related_name='warranty_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'warranty'


class Warrantyclaim(models.Model):
    warranty = models.ForeignKey(Warranty, models.DO_NOTHING, blank=True, null=True)
    claim_date = models.DateField()
    description = models.TextField()
    resolution = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    completed_date = models.DateField(blank=True, null=True)
    technician = models.ForeignKey(Employee, models.DO_NOTHING, blank=True, null=True)
    repair_cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    is_deleted = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)
    created_by = models.ForeignKey(Useraccount, models.DO_NOTHING, db_column='created_by', blank=True, null=True)
    updated_by = models.ForeignKey(Useraccount, models.DO_NOTHING, db_column='updated_by', related_name='warrantyclaim_updated_by_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'warrantyclaim'