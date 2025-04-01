from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from datetime import date
from .models import (
    ProductCategory, Brand, Product, Customer, Order,
    Employee, Store, Inventory, StockIn, StockOut, Revenue,
    Attribute, AttributeValue, CategoryAttribute, ProductVariant,
    ProductVariantAttribute, Shipment, ProductSpecification,
    ProductReview, ProductWishlist, Coupon, Return, WarrantyCard,
    PriceHistory, Notification, LoginHistory
)
from .validators import *
from .exceptions import *
import json

User = get_user_model()

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'Test@123',
            'password2': 'Test@123',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_user_registration(self):
        response = self.client.post(self.register_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, 'testuser')

    def test_user_login(self):
        # Đăng ký user trước
        self.client.post(self.register_url, self.user_data)
        # Đăng nhập
        response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'Test@123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

class ProductTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='Test@123'
        )
        self.client.force_authenticate(user=self.user)
        
        self.category = ProductCategory.objects.create(
            name='Test Category',
            description='Test Description'
        )
        self.brand = Brand.objects.create(
            name='Test Brand',
            description='Test Description'
        )
        self.product_data = {
            'name': 'Test Product',
            'description': 'Test Description',
            'category_id': self.category.id,
            'brand_id': self.brand.id,
            'base_price': 1000000
        }

    def test_create_product(self):
        response = self.client.post(reverse('product-list'), self.product_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 1)
        self.assertEqual(Product.objects.get().name, 'Test Product')

    def test_create_product_with_invalid_price(self):
        self.product_data['base_price'] = -1000
        response = self.client.post(reverse('product-list'), self.product_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_product_list(self):
        Product.objects.create(**self.product_data)
        response = self.client.get(reverse('product-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

class OrderTests(APITestCase):
    def setUp(self):
        # Tạo superuser
        self.superuser = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com'
        )
        self.client.force_authenticate(user=self.superuser)

        # Tạo cửa hàng
        self.store = Store.objects.create(
            name='Test Store',
            address='Test Address',
            opening_date='2025-04-02'
        )

        # Tạo danh mục sản phẩm
        self.category = ProductCategory.objects.create(
            name='Test Category',
            description='Test Description'
        )

        # Tạo thương hiệu
        self.brand = Brand.objects.create(
            name='Test Brand',
            description='Test Description'
        )

        # Tạo sản phẩm
        self.product = Product.objects.create(
            name='Test Product',
            category=self.category,
            brand=self.brand,
            base_price=1000000
        )

        # Tạo khách hàng
        self.customer = Customer.objects.create(
            first_name='Test',
            last_name='Customer',
            email='customer@example.com',
            phone='0123456789'
        )

        # Tạo inventory
        self.inventory = Inventory.objects.create(
            store=self.store,
            product=self.product,
            quantity_in_stock=10,
            minimum_stock=5,
            maximum_stock=20
        )

        # Dữ liệu tạo đơn hàng
        self.order_data = {
            'store_id': self.store.id,
            'customer_id': self.customer.id,
            'order_details': json.dumps([
                {
                    'product_id': self.product.id,
                    'quantity': 2
                }
            ]),
            'shipping_address': 'Test Address',
            'shipping_fee': 50000,
            'discount_amount': 0,
            'payment_method': 'cash',
            'status': 'pending'
        }

    def test_create_order(self):
        print("Order data:", self.order_data)
        response = self.client.post(reverse('order-list'), self.order_data)
        print("Order response:", response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        order = Order.objects.first()
        self.assertEqual(order.total_amount, 2000000)  # 2 * 1000000 (base_price)
        self.assertEqual(order.final_amount, 2050000)  # total_amount + shipping_fee - discount_amount

    def test_create_order_with_invalid_status(self):
        self.order_data['status'] = 'invalid_status'
        response = self.client.post(reverse('order-list'), self.order_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class InventoryTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(
            username='admin',
            password='Admin@123',
            email='admin@example.com'
        )
        self.client.force_authenticate(user=self.user)
        
        self.store = Store.objects.create(
            name='Test Store',
            address='Test Address',
            opening_date=date.today()
        )
        self.category = ProductCategory.objects.create(
            name='Test Category',
            description='Test Description'
        )
        self.brand = Brand.objects.create(
            name='Test Brand',
            description='Test Description'
        )
        self.product = Product.objects.create(
            name='Test Product',
            base_price=1000000,
            brand=self.brand,
            category=self.category
        )
        self.inventory_data = {
            'store_id': self.store.id,
            'product_id': self.product.id,
            'quantity_in_stock': 10,
            'minimum_stock': 5,
            'maximum_stock': 20
        }

    def test_create_inventory(self):
        response = self.client.post(reverse('inventory-list'), self.inventory_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Inventory.objects.count(), 1)

    def test_create_inventory_with_negative_quantity(self):
        self.inventory_data['quantity_in_stock'] = -5
        response = self.client.post(reverse('inventory-list'), self.inventory_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class StockInTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(
            username='admin',
            password='Admin@123',
            email='admin@example.com'
        )
        self.client.force_authenticate(user=self.user)
        
        self.store = Store.objects.create(
            name='Test Store',
            address='Test Address',
            opening_date=date.today()
        )
        self.category = ProductCategory.objects.create(
            name='Test Category',
            description='Test Description'
        )
        self.brand = Brand.objects.create(
            name='Test Brand',
            description='Test Description'
        )
        self.product = Product.objects.create(
            name='Test Product',
            base_price=1000000,
            brand=self.brand,
            category=self.category
        )
        # Tạo inventory trước
        self.inventory = Inventory.objects.create(
            store=self.store,
            product=self.product,
            quantity_in_stock=0,
            minimum_stock=0,
            maximum_stock=100
        )
        self.stock_in_data = {
            'store_id': self.store.id,
            'product_id': self.product.id,
            'quantity': 5,
            'cost_price': 800000.00,
            'stock_in_date': date.today(),
            'supplier_name': 'Test Supplier'
        }

    def test_create_stock_in(self):
        response = self.client.post(reverse('stock-in-list'), self.stock_in_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(StockIn.objects.count(), 1)

    def test_create_stock_in_with_invalid_quantity(self):
        self.stock_in_data['quantity'] = -5
        response = self.client.post(reverse('stock-in-list'), self.stock_in_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class StockOutTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(
            username='admin',
            password='Admin@123',
            email='admin@example.com'
        )
        self.client.force_authenticate(user=self.user)
        
        self.store = Store.objects.create(
            name='Test Store',
            address='Test Address',
            opening_date=date.today()
        )
        self.category = ProductCategory.objects.create(
            name='Test Category',
            description='Test Description'
        )
        self.brand = Brand.objects.create(
            name='Test Brand',
            description='Test Description'
        )
        self.product = Product.objects.create(
            name='Test Product',
            base_price=1000000,
            brand=self.brand,
            category=self.category
        )
        # Tạo inventory trước
        self.inventory = Inventory.objects.create(
            store=self.store,
            product=self.product,
            quantity_in_stock=10,
            minimum_stock=5,
            maximum_stock=20
        )
        # Tạo employee
        self.employee = Employee.objects.create(
            user=self.user,
            first_name='Test',
            last_name='Employee',
            email='employee@example.com',
            hire_date=date.today(),
            salary=10000000
        )
        self.stock_out_data = {
            'store_id': self.store.id,
            'product_id': self.product.id,
            'employee_id': self.employee.id,
            'quantity': 2,
            'sale_price': 1200000.00,
            'stock_out_date': date.today()
        }

    def test_create_stock_out(self):
        response = self.client.post(reverse('stock-out-list'), self.stock_out_data)
        print("StockOut response:", response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(StockOut.objects.count(), 1)

    def test_create_stock_out_with_insufficient_stock(self):
        self.stock_out_data['quantity'] = 20
        response = self.client.post(reverse('stock-out-list'), self.stock_out_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class RevenueTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(
            username='admin',
            password='Admin@123',
            email='admin@example.com'
        )
        self.client.force_authenticate(user=self.user)
        
        self.store = Store.objects.create(
            name='Test Store',
            address='Test Address',
            opening_date=date.today()
        )
        self.revenue_data = {
            'store_id': self.store.id,
            'revenue_amount': 10000000.00,
            'revenue_date': date.today()
        }

    def test_create_revenue(self):
        response = self.client.post(reverse('revenue-list'), self.revenue_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Revenue.objects.count(), 1)

    def test_get_daily_stats(self):
        Revenue.objects.create(
            store=self.store,
            revenue_amount=1500000.00,
            revenue_date=date.today()
        )
        response = self.client.get(
            reverse('revenue-daily-stats'),
            {'date': date.today().isoformat()}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_monthly_stats(self):
        Revenue.objects.create(
            store=self.store,
            revenue_amount=1500000.00,
            revenue_date=date.today()
        )
        response = self.client.get(
            reverse('revenue-monthly-stats'),
            {'year': date.today().year, 'month': date.today().month}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

class AttributeTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(
            username='admin',
            password='Admin@123',
            email='admin@example.com'
        )
        self.client.force_authenticate(user=self.user)
        
        self.attribute_data = {
            'name': 'Test Attribute',
            'description': 'Test Description'
        }

    def test_create_attribute(self):
        response = self.client.post(reverse('attribute-list'), self.attribute_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Attribute.objects.count(), 1)
        self.assertEqual(Attribute.objects.get().name, 'Test Attribute')

class ProductVariantTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(
            username='admin',
            password='Admin@123',
            email='admin@example.com'
        )
        self.client.force_authenticate(user=self.user)
        
        self.category = ProductCategory.objects.create(
            name='Test Category',
            description='Test Description'
        )
        self.brand = Brand.objects.create(
            name='Test Brand',
            description='Test Description'
        )
        self.product = Product.objects.create(
            name='Test Product',
            category=self.category,
            brand=self.brand,
            base_price=1000000
        )
        
        self.variant_data = {
            'product_id': self.product.id,
            'sku_code': 'TEST-SKU-001',
            'price_adjustment': 100000,
            'stock': 10
        }

    def test_create_variant(self):
        response = self.client.post(reverse('product-variant-list'), self.variant_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProductVariant.objects.count(), 1)
        self.assertEqual(ProductVariant.objects.get().sku_code, 'TEST-SKU-001')

class ShipmentTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(
            username='admin',
            password='Admin@123',
            email='admin@example.com'
        )
        self.client.force_authenticate(user=self.user)
        
        # Tạo order trước
        self.store = Store.objects.create(
            name='Test Store',
            address='Test Address',
            opening_date=date.today()
        )
        self.customer = Customer.objects.create(
            first_name='Test',
            last_name='Customer',
            email='customer@example.com',
            phone='0123456789'
        )
        self.order = Order.objects.create(
            store=self.store,
            customer=self.customer,
            total_amount=1000000,
            final_amount=1050000,
            shipping_address='Test Address',
            shipping_fee=50000,
            payment_method='cash',
            status='pending'
        )
        
        self.shipment_data = {
            'order_id': self.order.id,
            'shipping_method': 'standard',
            'tracking_number': 'TRACK001',
            'status': 'pending',
            'estimated_delivery_date': date.today()
        }

    def test_create_shipment(self):
        response = self.client.post(reverse('shipment-list'), self.shipment_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Shipment.objects.count(), 1)
        self.assertEqual(Shipment.objects.get().tracking_number, 'TRACK001')

class CouponTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(
            username='admin',
            password='Admin@123',
            email='admin@example.com'
        )
        self.client.force_authenticate(user=self.user)
        
        self.coupon_data = {
            'code': 'TEST123',
            'discount_type': 'percentage',
            'discount_value': 10,
            'start_date': date.today(),
            'end_date': date.today(),
            'usage_limit': 100
        }

    def test_create_coupon(self):
        response = self.client.post(reverse('coupon-list'), self.coupon_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Coupon.objects.count(), 1)
        self.assertEqual(Coupon.objects.get().code, 'TEST123')

    def test_verify_coupon(self):
        coupon = Coupon.objects.create(**self.coupon_data)
        response = self.client.post(
            reverse('coupon-verify'),
            {'code': 'TEST123'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_valid'])

class ProductReviewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(
            username='admin',
            password='Admin@123',
            email='admin@example.com'
        )
        self.client.force_authenticate(user=self.user)
        
        self.category = ProductCategory.objects.create(
            name='Test Category',
            description='Test Description'
        )
        self.brand = Brand.objects.create(
            name='Test Brand',
            description='Test Description'
        )
        self.product = Product.objects.create(
            name='Test Product',
            category=self.category,
            brand=self.brand,
            base_price=1000000
        )
        self.customer = Customer.objects.create(
            first_name='Test',
            last_name='Customer',
            email='customer@example.com',
            phone='0123456789'
        )
        
        self.review_data = {
            'product_id': self.product.id,
            'customer_id': self.customer.id,
            'rating': 5,
            'comment': 'Great product!'
        }

    def test_create_review(self):
        response = self.client.post(reverse('product-review-list'), self.review_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProductReview.objects.count(), 1)
        self.assertEqual(ProductReview.objects.get().rating, 5)

class NotificationTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(
            username='admin',
            password='Admin@123',
            email='admin@example.com'
        )
        self.client.force_authenticate(user=self.user)
        
        self.notification_data = {
            'title': 'Test Notification',
            'content': 'Test Content',
            'type': 'info',
            'created_by_id': self.user.id,
            'updated_by_id': self.user.id
        }

    def test_create_notification(self):
        response = self.client.post(reverse('notification-list'), self.notification_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Notification.objects.count(), 1)
        self.assertEqual(Notification.objects.get().title, 'Test Notification')

    def test_mark_as_read(self):
        notification = Notification.objects.create(
            title='Test Notification',
            content='Test Content',
            type='info',
            created_by=self.user
        )
        response = self.client.put(
            reverse('notification-read', kwargs={'pk': notification.id})
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Notification.objects.get().is_read)
