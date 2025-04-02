from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient, APITransactionTestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from decimal import Decimal
from .models import (
    ProductCategory, Brand, Product, Customer, Order, OrderDetail,
    Store, Employee, Inventory, StockIn, StockOut, Revenue, 
    Attribute, AttributeValue, CategoryAttribute, ProductVariant, 
    ProductVariantAttribute, Shipment, ProductSpecification, 
    ProductReview, ProductWishlist, Coupon, Return, WarrantyCard, 
    PriceHistory, Notification, LoginHistory, ProductImage
)
from .validators import *
from .exceptions import *
import json
from datetime import date, datetime, timedelta
from django.utils import timezone

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

class ProductAPITests(APITestCase):
    def setUp(self):
        # Tạo superuser test
        self.user = User.objects.create_superuser(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Tạo dữ liệu test
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
            description='Test Description',
            category=self.category,
            brand=self.brand,
            base_price=Decimal('100.00')
        )

    def test_list_products(self):
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_create_product(self):
        url = reverse('product-list')
        data = {
            'name': 'New Product',
            'description': 'New Description',
            'category_id': self.category.id,
            'brand_id': self.brand.id,
            'base_price': '150.00'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 2)

    def test_retrieve_product(self):
        url = reverse('product-detail', args=[self.product.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Product')

    def test_update_product(self):
        url = reverse('product-detail', args=[self.product.id])
        data = {
            'name': 'Updated Product',
            'base_price': '200.00'
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.name, 'Updated Product')
        self.assertEqual(self.product.base_price, Decimal('200.00'))

    def test_delete_product(self):
        url = reverse('product-detail', args=[self.product.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Product.objects.count(), 0)

class OrderAPITests(APITestCase):
    def setUp(self):
        # Tạo superuser test
        self.user = User.objects.create_superuser(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Tạo dữ liệu test
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
            description='Test Description',
            category=self.category,
            brand=self.brand,
            base_price=Decimal('100.00')
        )
        self.customer = Customer.objects.create(
            first_name='Test',
            last_name='Customer',
            phone='0123456789'
        )
        self.store = Store.objects.create(
            name='Test Store',
            address='Test Address',
            phone='0123456789',
            store_code='TEST001',
            store_type='Retail',
            opening_date='2024-01-01'
        )
        self.order = Order.objects.create(
            customer=self.customer,
            store=self.store,
            total_amount=Decimal('100.00'),
            payment_method='Cash',
            shipping_address='Test Address',
            final_amount=Decimal('100.00')
        )
        self.order_detail = OrderDetail.objects.create(
            order=self.order,
            product=self.product,
            quantity=1,
            unit_price=Decimal('100.00')
        )

    def test_list_orders(self):
        url = reverse('order-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_create_order(self):
        url = reverse('order-list')
        data = {
            'customer_id': self.customer.id,
            'store_id': self.store.id,
            'total_amount': '150.00',
            'payment_method': 'Cash',
            'shipping_address': 'New Address',
            'final_amount': '150.00',
            'order_details': [
                {
                    'product_id': self.product.id,
                    'quantity': 1,
                    'unit_price': '150.00'
                }
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 2)

    def test_retrieve_order(self):
        url = reverse('order-detail', args=[self.order.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_amount'], '100.00')

    def test_update_order_status(self):
        url = reverse('order-detail', args=[self.order.id])
        data = {'status': 'processing'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, 'processing')

    def test_delete_order(self):
        url = reverse('order-detail', args=[self.order.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Order.objects.count(), 0)

class CustomerAPITests(APITestCase):
    def setUp(self):
        # Tạo superuser test
        self.user = User.objects.create_superuser(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Tạo dữ liệu test
        self.customer = Customer.objects.create(
            first_name='Test',
            last_name='Customer',
            phone='0123456789',
            email='test@example.com'
        )

    def test_list_customers(self):
        url = reverse('customer-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_create_customer(self):
        url = reverse('customer-list')
        data = {
            'first_name': 'New',
            'last_name': 'Customer',
            'phone': '0987654321',
            'email': 'new@example.com'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Customer.objects.count(), 2)

    def test_retrieve_customer(self):
        url = reverse('customer-detail', args=[self.customer.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Test')

    def test_update_customer(self):
        url = reverse('customer-detail', args=[self.customer.id])
        data = {
            'first_name': 'Updated',
            'last_name': 'Customer'
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.first_name, 'Updated')
        self.assertEqual(self.customer.last_name, 'Customer')

    def test_delete_customer(self):
        url = reverse('customer-detail', args=[self.customer.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Customer.objects.count(), 0)

class StoreAPITests(APITestCase):
    def setUp(self):
        # Tạo superuser test
        self.user = User.objects.create_superuser(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Tạo dữ liệu test
        self.employee = Employee.objects.create(
            user=self.user,
            first_name='Test',
            last_name='Employee',
            email='employee@example.com',
            phone='0123456789',
            role='Manager',
            hire_date='2024-01-01',
            employee_code='EMP001',
            position='Store Manager',
            department='Management',
            salary=Decimal('1000.00')
        )
        self.store = Store.objects.create(
            name='Test Store',
            address='Test Address',
            phone='0123456789',
            store_code='TEST001',
            store_type='Retail',
            manager=self.employee,
            opening_date='2024-01-01'
        )

    def test_list_stores(self):
        url = reverse('store-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_create_store(self):
        url = reverse('store-list')
        data = {
            'name': 'New Store',
            'address': 'New Address',
            'phone': '0987654321',
            'store_code': 'TEST002',
            'store_type': 'Retail',
            'manager_id': self.employee.id,
            'opening_date': '2024-01-01'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Store.objects.count(), 2)

    def test_retrieve_store(self):
        url = reverse('store-detail', args=[self.store.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Store')

    def test_update_store(self):
        url = reverse('store-detail', args=[self.store.id])
        data = {
            'name': 'Updated Store',
            'address': 'Updated Address'
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.store.refresh_from_db()
        self.assertEqual(self.store.name, 'Updated Store')
        self.assertEqual(self.store.address, 'Updated Address')

    def test_delete_store(self):
        url = reverse('store-detail', args=[self.store.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Store.objects.count(), 0)

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

class ProductImageTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com'
        )
        cls.category = ProductCategory.objects.create(
            name='Test Category',
            description='Test Description'
        )
        cls.brand = Brand.objects.create(
            name='Test Brand',
            description='Test Description'
        )
        cls.product = Product.objects.create(
            name='Test Product',
            description='Test Description',
            category=cls.category,
            brand=cls.brand,
            base_price=1000000,
            is_active=True
        )
        cls.image_data = {
            'product': cls.product.id,
            'image_url': 'http://example.com/test.jpg',
            'is_main': True,
            'display_order': 0,
            'created_by': cls.user.id,
            'updated_by': cls.user.id
        }
        cls.url = reverse('product-image-list')

    def setUp(self):
        self.client.force_authenticate(user=self.user)
        ProductImage.objects.all().delete()
        self.image = ProductImage.objects.create(
            product=self.product,
            image_url='http://example.com/test.jpg',
            is_main=True,
            display_order=0,
            created_by=self.user,
            updated_by=self.user
        )

    def test_create_product_image(self):
        response = self.client.post(self.url, self.image_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProductImage.objects.count(), 2)

    def test_list_product_images(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_product_image(self):
        url = reverse('product-image-detail', kwargs={'pk': self.image.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_product_image(self):
        url = reverse('product-image-detail', kwargs={'pk': self.image.pk})
        data = {'is_main': False}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(ProductImage.objects.get(pk=self.image.pk).is_main, False)

    def test_delete_product_image(self):
        url = reverse('product-image-detail', kwargs={'pk': self.image.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ProductImage.objects.count(), 0)

class ProductSpecificationTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com'
        )
        cls.category = ProductCategory.objects.create(
            name='Test Category',
            description='Test Description'
        )
        cls.brand = Brand.objects.create(
            name='Test Brand',
            description='Test Description'
        )
        cls.product = Product.objects.create(
            name='Test Product',
            description='Test Description',
            category=cls.category,
            brand=cls.brand,
            base_price=1000000,
            is_active=True
        )
        cls.spec_data = {
            'product': cls.product.id,
            'name': 'Test Specification',
            'value': 'Test Value',
            'display_order': 0,
            'created_by': cls.user.id,
            'updated_by': cls.user.id
        }
        cls.url = reverse('product-specification-list')

    def setUp(self):
        self.client.force_authenticate(user=self.user)
        ProductSpecification.objects.all().delete()
        self.specification = ProductSpecification.objects.create(
            product=self.product,
            name='Test Specification',
            value='Test Value',
            display_order=0,
            created_by=self.user,
            updated_by=self.user
        )

    def test_create_product_specification(self):
        response = self.client.post(self.url, self.spec_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProductSpecification.objects.count(), 2)

    def test_list_product_specifications(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_product_specification(self):
        url = reverse('product-specification-detail', kwargs={'pk': self.specification.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_product_specification(self):
        url = reverse('product-specification-detail', kwargs={'pk': self.specification.pk})
        data = {'value': 'Updated Value'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(ProductSpecification.objects.get(pk=self.specification.pk).value, 'Updated Value')

    def test_delete_product_specification(self):
        url = reverse('product-specification-detail', kwargs={'pk': self.specification.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ProductSpecification.objects.count(), 0)

class ProductWishlistTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com'
        )
        cls.customer = Customer.objects.create(
            first_name='Test',
            last_name='Customer',
            email='test@example.com',
            phone='0123456789',
            address='Test Address'
        )
        cls.category = ProductCategory.objects.create(
            name='Test Category',
            description='Test Description'
        )
        cls.brand = Brand.objects.create(
            name='Test Brand',
            description='Test Description'
        )
        cls.product = Product.objects.create(
            name='Test Product',
            description='Test Description',
            category=cls.category,
            brand=cls.brand,
            base_price=1000000,
            is_active=True
        )
        cls.wishlist_data = {
            'customer': cls.customer.id,
            'product': cls.product.id,
            'created_by': cls.user.id,
            'updated_by': cls.user.id
        }
        cls.url = reverse('product-wishlist-list')

    def setUp(self):
        self.client.force_authenticate(user=self.user)
        ProductWishlist.objects.all().delete()
        self.wishlist = ProductWishlist.objects.create(
            customer=self.customer,
            product=self.product,
            created_by=self.user,
            updated_by=self.user
        )

    def test_create_product_wishlist(self):
        response = self.client.post(self.url, self.wishlist_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProductWishlist.objects.count(), 2)

    def test_list_product_wishlists(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_product_wishlist(self):
        url = reverse('product-wishlist-detail', kwargs={'pk': self.wishlist.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_product_wishlist(self):
        url = reverse('product-wishlist-detail', kwargs={'pk': self.wishlist.pk})
        data = {'product': self.product.id}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(ProductWishlist.objects.get(pk=self.wishlist.pk).product, self.product)

    def test_delete_product_wishlist(self):
        url = reverse('product-wishlist-detail', kwargs={'pk': self.wishlist.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ProductWishlist.objects.count(), 0)

class LoginHistoryTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com'
        )
        cls.login_data = {
            'user': cls.user.id,
            'ip_address': '127.0.0.1',
            'device_info': 'Test Device',
            'status': 'Success'
        }
        cls.url = reverse('login-history-list')

    def setUp(self):
        self.client.force_authenticate(user=self.user)
        LoginHistory.objects.all().delete()
        self.login_history = LoginHistory.objects.create(
            user=self.user,
            ip_address='127.0.0.1',
            device_info='Test Device',
            status='Success'
        )

    def test_create_login_history(self):
        response = self.client.post(self.url, self.login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(LoginHistory.objects.count(), 2)

    def test_list_login_histories(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_login_history(self):
        url = reverse('login-history-detail', kwargs={'pk': self.login_history.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_login_history(self):
        url = reverse('login-history-detail', kwargs={'pk': self.login_history.pk})
        data = {'status': 'Failed'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(LoginHistory.objects.get(pk=self.login_history.pk).status, 'Failed')

    def test_delete_login_history(self):
        url = reverse('login-history-detail', kwargs={'pk': self.login_history.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(LoginHistory.objects.count(), 0)

class PriceHistoryTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com'
        )
        cls.category = ProductCategory.objects.create(
            name='Test Category',
            description='Test Description'
        )
        cls.brand = Brand.objects.create(
            name='Test Brand',
            description='Test Description'
        )
        cls.product = Product.objects.create(
            name='Test Product',
            description='Test Description',
            category=cls.category,
            brand=cls.brand,
            base_price=1000000,
            is_active=True
        )
        cls.price_history_data = {
            'product': cls.product.id,
            'old_price': 1000000,
            'new_price': 1200000,
            'changed_by': cls.user.id,
            'reason': 'Price Update'
        }
        cls.url = reverse('price-history-list')

    def setUp(self):
        self.client.force_authenticate(user=self.user)
        PriceHistory.objects.all().delete()
        self.price_history = PriceHistory.objects.create(
            product=self.product,
            old_price=1000000,
            new_price=1200000,
            changed_by=self.user,
            reason='Price Update'
        )

    def test_create_price_history(self):
        response = self.client.post(self.url, self.price_history_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PriceHistory.objects.count(), 2)

    def test_list_price_histories(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_price_history(self):
        url = reverse('price-history-detail', kwargs={'pk': self.price_history.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_price_history(self):
        url = reverse('price-history-detail', kwargs={'pk': self.price_history.pk})
        data = {'new_price': 1500000}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(PriceHistory.objects.get(pk=self.price_history.pk).new_price, 1500000)

    def test_delete_price_history(self):
        url = reverse('price-history-detail', kwargs={'pk': self.price_history.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(PriceHistory.objects.count(), 0)

class ReturnTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com'
        )
        cls.employee = Employee.objects.create(
            user=cls.user,
            first_name='Test',
            last_name='Employee',
            email='employee@example.com',
            phone='1234567890',
            role='manager',
            hire_date=timezone.now().date(),
            employee_code='EMP001',
            position='Manager',
            department='Sales',
            salary=10000000
        )
        cls.store = Store.objects.create(
            name='Test Store',
            address='Test Address',
            phone='1234567890',
            store_code='ST001',
            store_type='retail',
            manager=cls.employee,
            opening_date=timezone.now().date()
        )
        cls.category = ProductCategory.objects.create(
            name='Test Category',
            description='Test Description'
        )
        cls.brand = Brand.objects.create(
            name='Test Brand',
            description='Test Description'
        )
        cls.product = Product.objects.create(
            name='Test Product',
            description='Test Description',
            category=cls.category,
            brand=cls.brand,
            base_price=1000000,
            is_active=True
        )
        cls.customer = Customer.objects.create(
            first_name='Test',
            last_name='Customer',
            email='test@example.com',
            phone='1234567890',
            address='Test Address'
        )
        cls.order = Order.objects.create(
            customer=cls.customer,
            store=cls.store,
            total_amount=1000000,
            final_amount=1000000,
            status='completed',
            payment_method='cash',
            shipping_address='Test Address',
            shipping_fee=0,
            discount_amount=0
        )
        cls.return_data = {
            'order': cls.order.id,
            'product': cls.product.id,
            'quantity': 1,
            'reason': 'Test Reason',
            'status': 'pending'
        }
        cls.url = reverse('return-list')

    def setUp(self):
        self.client.force_authenticate(user=self.user)
        Return.objects.all().delete()
        self.return_obj = Return.objects.create(
            order=self.order,
            product=self.product,
            quantity=1,
            reason='Test Reason',
            status='pending'
        )

    def test_create_return(self):
        response = self.client.post(self.url, self.return_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Return.objects.count(), 2)

    def test_list_returns(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_return(self):
        url = reverse('return-detail', kwargs={'pk': self.return_obj.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_return(self):
        url = reverse('return-detail', kwargs={'pk': self.return_obj.pk})
        data = {'status': 'approved'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Return.objects.get(pk=self.return_obj.pk).status, 'approved')

    def test_delete_return(self):
        url = reverse('return-detail', kwargs={'pk': self.return_obj.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Return.objects.count(), 0)

class WarrantyCardTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create_superuser(
            username='admin',
            password='admin123',
            email='admin@example.com'
        )
        cls.customer = Customer.objects.create(
            first_name='Test',
            last_name='Customer',
            email='test@example.com',
            phone='0123456789',
            address='Test Address'
        )
        cls.category = ProductCategory.objects.create(
            name='Test Category',
            description='Test Description'
        )
        cls.brand = Brand.objects.create(
            name='Test Brand',
            description='Test Description'
        )
        cls.product = Product.objects.create(
            name='Test Product',
            description='Test Description',
            category=cls.category,
            brand=cls.brand,
            base_price=1000000,
            is_active=True
        )
        cls.employee = Employee.objects.create(
            user=cls.user,
            first_name='Test',
            last_name='Employee',
            email='employee@example.com',
            phone='0123456789',
            role='manager',
            hire_date=timezone.now().date(),
            employee_code='EMP001',
            position='Manager',
            department='Sales',
            salary=10000000
        )
        cls.store = Store.objects.create(
            name='Test Store',
            address='Test Address',
            phone='0123456789',
            store_code='TEST001',
            store_type='Retail',
            manager=cls.employee,
            opening_date=timezone.now()
        )
        cls.order = Order.objects.create(
            customer=cls.customer,
            store=cls.store,
            total_amount=1000000,
            final_amount=1000000,
            status='Completed',
            payment_method='Cash',
            shipping_address='Test Address',
            shipping_fee=0,
            discount_amount=0
        )
        cls.warranty_data = {
            'product': cls.product.id,
            'customer': cls.customer.id,
            'order': cls.order.id,
            'issue_date': timezone.now().isoformat(),
            'expiry_date': (timezone.now() + timezone.timedelta(days=365)).isoformat(),
            'status': 'Active',
            'created_by': cls.user.id,
            'updated_by': cls.user.id
        }
        cls.url = reverse('warranty-card-list')

    def setUp(self):
        self.client.force_authenticate(user=self.user)
        WarrantyCard.objects.all().delete()
        self.warranty_card = WarrantyCard.objects.create(
            product=self.product,
            customer=self.customer,
            order=self.order,
            issue_date=timezone.now(),
            expiry_date=timezone.now() + timezone.timedelta(days=365),
            status='Active',
            created_by=self.user,
            updated_by=self.user
        )

    def test_create_warranty_card(self):
        response = self.client.post(self.url, self.warranty_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(WarrantyCard.objects.count(), 2)

    def test_list_warranty_cards(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_warranty_card(self):
        url = reverse('warranty-card-detail', kwargs={'pk': self.warranty_card.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_warranty_card(self):
        url = reverse('warranty-card-detail', kwargs={'pk': self.warranty_card.pk})
        data = {'status': 'Active'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(WarrantyCard.objects.get(pk=self.warranty_card.pk).status, 'Active')

    def test_delete_warranty_card(self):
        url = reverse('warranty-card-detail', kwargs={'pk': self.warranty_card.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(WarrantyCard.objects.count(), 0)
