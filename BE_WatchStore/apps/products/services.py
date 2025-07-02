from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.core.cache import cache
from django.db.models import Q, Count, Avg, Sum
from apps.products.models.product import Product
from apps.products.models.variant import ProductVariant, VariantImage
from apps.products.utils import convert_to_png
from apps.inventory.services import InventoryService

class ProductService:
    @staticmethod
    def create_product_with_variants(product_data, variants_data):
        """Tạo product với variants"""
        try:
            with transaction.atomic():
                # Validate product data
                ProductService.validate_product_data(product_data)
                
                # Tạo product
                product = Product.objects.create(**product_data)
                
                # Tạo variants
                created_variants = []
                for variant_data in variants_data:
                    ProductService.validate_variant_data(variant_data)
                    attribute_values = variant_data.pop('attribute_values', [])
                    variant = ProductVariant.create_variant_with_attributes(
                        product=product,
                        attribute_values=attribute_values,
                        **variant_data
                    )
                    created_variants.append(variant)
                
                # Tạo inventory cho tất cả variants
                InventoryService.create_inventory_for_product(product)
                
                # Clear cache
                ProductService.clear_product_cache()
                
                return product, created_variants
                
        except Exception as e:
            raise ValidationError(f"Error creating product with variants: {str(e)}")
    
    @staticmethod
    def bulk_update_variants(product, variants_data):
        """Cập nhật hàng loạt variants cho product"""
        try:
            with transaction.atomic():
                # Validate product
                if not product or product.is_deleted:
                    raise ValidationError("Invalid product")
                
                # Delete existing variants
                product.variants.all().delete()
                
                # Create new variants
                created_variants = []
                for variant_data in variants_data:
                    ProductService.validate_variant_data(variant_data)
                    attribute_values = variant_data.pop('attribute_values', [])
                    
                    # Validate variant combination
                    is_valid, message = ProductService.validate_variant_combination(
                        product, attribute_values
                    )
                    if not is_valid:
                        raise ValidationError(f"Invalid variant combination: {message}")
                    
                    variant = ProductVariant.objects.create(product=product, **variant_data)
                    variant.attribute_values.set(attribute_values)
                    variant.sku = variant.generate_sku()
                    variant.save()
                    created_variants.append(variant)
                
                # Clear cache
                ProductService.clear_product_cache()
                
                return created_variants
                
        except Exception as e:
            raise ValidationError(f"Error bulk updating variants: {str(e)}")
    
    @staticmethod
    def get_optimized_queryset(filters=None):
        """Lấy queryset đã được tối ưu với caching, lưu lại cache key để clear nhanh."""
        cache_key = f'product_queryset_{hash(str(filters)) if filters else "default"}'
        cached_queryset = cache.get(cache_key)
        if cached_queryset is None:
            queryset = Product.objects.filter(is_deleted=False).select_related(
                'category', 'brand', 'default_variant'
            ).prefetch_related(
                'variants', 'variants__attribute_values',
                'images'
            )
            # Apply filters
            if filters:
                if filters.get('category'):
                    queryset = queryset.filter(category_id=filters['category'])
                if filters.get('brand'):
                    queryset = queryset.filter(brand_id=filters['brand'])
                if filters.get('min_price'):
                    queryset = queryset.filter(base_price__gte=filters['min_price'])
                if filters.get('max_price'):
                    queryset = queryset.filter(base_price__lte=filters['max_price'])
                if filters.get('search'):
                    queryset = queryset.filter(
                        Q(name__icontains=filters['search']) | 
                        Q(description__icontains=filters['search'])
                    )
                if filters.get('featured'):
                    queryset = queryset.filter(is_featured=True)
                if filters.get('is_active') is not None:
                    queryset = queryset.filter(is_active=filters['is_active'])
            queryset = queryset.order_by('-updated_at', '-created_at')
            cache.set(cache_key, queryset, timeout=30)  # 30s cho dev
            # Lưu lại key vào một set trong cache để xóa sau
            cache_keys = cache.get('product_queryset_keys', set())
            cache_keys.add(cache_key)
            cache.set('product_queryset_keys', cache_keys, timeout=None)
            return queryset
        return cached_queryset
    
    @staticmethod
    def get_variants_for_product(product, filters=None):
        """Lấy variants của product với tối ưu hóa"""
        variants = product.variants.filter(is_deleted=False).select_related(
            'product'
        ).prefetch_related(
            'attribute_values',
            'attribute_values__attribute_type',
            'images'
        ).order_by('-id')
        
        # Apply filters
        if filters:
            if filters.get('search'):
                variants = variants.filter(
                    Q(attribute_values__value__icontains=filters['search']) |
                    Q(sku__icontains=filters['search'])
                ).distinct()
            
            if filters.get('attr_values'):
                for value in filters['attr_values']:
                    variants = variants.filter(
                        attribute_values__value__icontains=value
                    ).distinct()
            
            if filters.get('is_active') is not None:
                variants = variants.filter(is_active=filters['is_active'])
            
            if filters.get('sort_by'):
                sort_by = filters['sort_by']
                if sort_by == 'sku':
                    variants = variants.order_by('sku')
                elif sort_by == '-sku':
                    variants = variants.order_by('-sku')
                elif sort_by == 'price':
                    variants = variants.order_by('price_adjustment')
                elif sort_by == '-price':
                    variants = variants.order_by('-price_adjustment')
        
        return variants
    
    @staticmethod
    def get_attributes_for_product(product):
        """Lấy attributes và values của product với tối ưu hóa"""
        from apps.products.models.attribute import AttributeValue, AttributeType
        
        # Lấy tất cả variants của sản phẩm
        variants = product.variants.filter(is_deleted=False)
        
        # Lấy tất cả attribute values từ các variants
        attribute_values = AttributeValue.objects.filter(
            variants__in=variants,
            is_deleted=False
        ).distinct()
        
        # Nhóm các values theo attribute type
        result = []
        for attr_type in attribute_values.values_list('attribute_type', flat=True).distinct():
            attr = AttributeType.objects.get(id=attr_type)
            values = attribute_values.filter(attribute_type=attr)
            
            attr_data = {
                'id': attr.id,
                'name': attr.name,
                'description': attr.description,
                'values': [
                    {
                        'id': value.id,
                        'value': value.value
                    }
                    for value in values
                ]
            }
            result.append(attr_data)
            
        return result
    
    @staticmethod
    def clear_product_cache():
        """Xóa tất cả cache key đã lưu cho product queryset."""
        cache_keys = cache.get('product_queryset_keys', set())
        for key in cache_keys:
            cache.delete(key)
        cache.delete('product_queryset_keys')
    
    @staticmethod
    def set_primary_image(product, image_id):
        """Đặt ảnh chính cho sản phẩm"""
        try:
            with transaction.atomic():
                # Lấy ảnh cần đặt làm ảnh chính
                image = product.images.get(id=image_id)
                
                # Cập nhật tất cả ảnh của sản phẩm thành không phải ảnh chính
                product.images.all().update(is_primary=False)
                
                # Đặt ảnh được chọn làm ảnh chính
                image.is_primary = True
                image.save()
                
                # Clear cache
                ProductService.clear_product_cache()
                
                return image
                
        except product.images.model.DoesNotExist:
            raise ValidationError("Không tìm thấy ảnh")
        except Exception as e:
            raise ValidationError(f"Error setting primary image: {str(e)}")
    
    @staticmethod
    def validate_variant_combination(product, attribute_values):
        """Kiểm tra tính hợp lệ của variant combination"""
        try:
            # Kiểm tra đủ attributes
            product_attributes = product.get_attributes()
            if len(attribute_values) != product_attributes.count():
                return False, "Insufficient attributes"
            
            # Kiểm tra duplicate
            existing = ProductVariant.objects.filter(
                product=product,
                attribute_values__in=attribute_values
            ).first()
            
            if existing:
                return False, "Variant combination already exists"
            
            return True, "Valid combination"
            
        except Exception as e:
            return False, f"Error validating combination: {str(e)}"
    
    @staticmethod
    def get_product_statistics():
        """Lấy thống kê product"""
        try:
            from django.db.models import Count, Avg
            
            total_products = Product.objects.filter(is_deleted=False).count()
            active_products = Product.objects.filter(
                is_deleted=False,
                is_active=True
            ).count()
            
            total_variants = ProductVariant.objects.filter(
                is_deleted=False,
                is_active=True
            ).count()
            
            avg_price = Product.objects.filter(
                is_deleted=False,
                is_active=True
            ).aggregate(avg=Avg('base_price'))['avg'] or 0
            
            products_with_warranty = Product.objects.filter(
                is_deleted=False,
                warranty_period__gt=0
            ).count()
            
            return {
                'total_products': total_products,
                'active_products': active_products,
                'total_variants': total_variants,
                'avg_price': avg_price,
                'products_with_warranty': products_with_warranty,
            }
            
        except Exception as e:
            print(f"Error getting product statistics: {str(e)}")
            return {}
    
    @staticmethod
    def get_low_stock_products(threshold=5):
        """Lấy danh sách sản phẩm tồn kho thấp"""
        try:
            from apps.inventory.models.inventory import Inventory
            from django.db.models import Sum
            
            # Lấy tổng tồn kho theo variant
            low_stock_variants = Inventory.objects.filter(
                is_deleted=False
            ).values(
                'product_variant__product__name',
                'product_variant__sku'
            ).annotate(
                total_quantity=Sum('quantity')
            ).filter(
                total_quantity__lte=threshold
            )
            
            return list(low_stock_variants)
            
        except Exception as e:
            print(f"Error getting low stock products: {str(e)}")
            return []
    
    @staticmethod
    def update_product_pricing(product, new_base_price):
        """Cập nhật giá sản phẩm"""
        try:
            with transaction.atomic():
                old_price = product.base_price
                product.base_price = new_base_price
                product.updated_by = product.updated_by  # Giữ nguyên updated_by
                product.save()
                
                # Cập nhật giá cho tất cả variants
                for variant in product.variants.filter(is_active=True):
                    # Giá variant = base_price + price_adjustment
                    # Không cần thay đổi gì vì variant.get_final_price() sẽ tính tự động
                    pass
                
                return product
                
        except Exception as e:
            raise ValidationError(f"Error updating product pricing: {str(e)}")
    
    @staticmethod
    def deactivate_product(product, user=None):
        """Deactivate product và tất cả variants"""
        try:
            with transaction.atomic():
                product.is_active = False
                product.updated_by = user
                product.save()
                
                # Deactivate tất cả variants
                for variant in product.variants.all():
                    variant.is_active = False
                    variant.updated_by = user
                    variant.save()
                
                return product
                
        except Exception as e:
            raise ValidationError(f"Error deactivating product: {str(e)}")
    
    @staticmethod
    def get_product_performance(product, start_date=None, end_date=None):
        """Lấy hiệu suất bán hàng của sản phẩm"""
        try:
            from apps.orders.models.order_detail import OrderDetail
            from django.db.models import Sum, Count
            
            queryset = OrderDetail.objects.filter(
                product_variant__product=product,
                is_deleted=False
            )
            
            if start_date:
                queryset = queryset.filter(order__order_date__gte=start_date)
            if end_date:
                queryset = queryset.filter(order__order_date__lte=end_date)
            
            performance = queryset.aggregate(
                total_quantity=Sum('quantity'),
                total_revenue=Sum('final_price'),
                total_orders=Count('order', distinct=True)
            )
            
            # Tính trung bình giá bán
            if performance['total_quantity'] and performance['total_quantity'] > 0:
                performance['avg_price'] = performance['total_revenue'] / performance['total_quantity']
            else:
                performance['avg_price'] = 0
            
            return performance
            
        except Exception as e:
            print(f"Error getting product performance: {str(e)}")
            return {}
    
    @staticmethod
    def get_warranty_products():
        """Lấy danh sách sản phẩm có bảo hành"""
        try:
            return Product.objects.filter(
                is_deleted=False,
                is_active=True,
                warranty_period__gt=0
            ).order_by('name')
            
        except Exception as e:
            print(f"Error getting warranty products: {str(e)}")
            return Product.objects.none()
    
    @staticmethod
    def validate_product_data(product_data):
        """Validate dữ liệu product trước khi tạo/cập nhật"""
        errors = {}
        
        # Kiểm tra tên sản phẩm
        if not product_data.get('name'):
            errors['name'] = 'Product name is required'
        
        # Kiểm tra giá
        if product_data.get('base_price') and product_data['base_price'] < 0:
            errors['base_price'] = 'Base price cannot be negative'
        
        # Kiểm tra warranty period
        if product_data.get('warranty_period') and product_data['warranty_period'] < 0:
            errors['warranty_period'] = 'Warranty period cannot be negative'
        
        # Kiểm tra category
        if not product_data.get('category'):
            errors['category'] = 'Category is required'
        
        if errors:
            raise ValidationError(errors)
        
        return True
    
    @staticmethod
    def validate_variant_data(variant_data):
        """Validate dữ liệu variant trước khi tạo/cập nhật"""
        errors = {}
        
        # Bỏ check product vì đã truyền product riêng
        # if not variant_data.get('product'):
        #     errors['product'] = 'Product is required'
        
        # Kiểm tra price adjustment
        if variant_data.get('price_adjustment') and variant_data['price_adjustment'] < 0:
            errors['price_adjustment'] = 'Price adjustment cannot be negative'
        
        # Kiểm tra stock alert threshold
        if variant_data.get('stock_alert_threshold') and variant_data['stock_alert_threshold'] < 0:
            errors['stock_alert_threshold'] = 'Stock alert threshold cannot be negative'
        
        if errors:
            raise ValidationError(errors)
        
        return True

class ProductVariantService:
    @staticmethod
    def get_optimized_queryset(filters=None):
        """Lấy queryset variants đã được tối ưu"""
        queryset = ProductVariant.objects.filter(is_deleted=False).select_related(
            'product'
        ).prefetch_related(
            'attribute_values',
            'attribute_values__attribute_type',
            'images'
        ).order_by('-id')

        # Apply filters
        if filters:
            if filters.get('product_id'):
                queryset = queryset.filter(product_id=filters['product_id'])

            if filters.get('search'):
                queryset = queryset.filter(
                    Q(product__name__icontains=filters['search']) |
                    Q(attribute_values__value__icontains=filters['search'])
                ).distinct()

            if filters.get('attr_values'):
                for value in filters['attr_values']:
                    subquery = ProductVariant.objects.filter(
                        attribute_values__value__icontains=value
                    ).values('id')
                    queryset = queryset.filter(id__in=subquery)

            if filters.get('attr_type'):
                queryset = queryset.filter(
                    attribute_values__attribute_type__name__icontains=filters['attr_type']
                )

            if filters.get('sort_by'):
                sort_by = filters['sort_by']
                if sort_by == 'product_name':
                    queryset = queryset.order_by('product__name', '-id')
                elif sort_by == '-product_name':
                    queryset = queryset.order_by('-product__name', '-id')

            if filters.get('attr_value'):
                queryset = queryset.filter(
                    attribute_values__value__icontains=filters['attr_value']
                ).order_by('attribute_values__value', '-id')

        return queryset.distinct()
    
    @staticmethod
    def upload_variant_images(variant, images, alt_texts=None):
        """Upload nhiều ảnh cho variant"""
        try:
            created_images = []
            for idx, image in enumerate(images):
                alt_text = alt_texts[idx] if alt_texts and idx < len(alt_texts) else ''
                # Chuyển đổi ảnh sang PNG
                png_image = convert_to_png(image)
                variant_image = VariantImage.objects.create(
                    variant=variant,
                    image=png_image,
                    alt_text=alt_text
                )
                created_images.append(variant_image)
            
            return created_images
            
        except Exception as e:
            raise ValidationError(f"Error uploading variant images: {str(e)}")
    
    @staticmethod
    def delete_variant_image(variant, image_id):
        """Xóa một ảnh của variant"""
        try:
            image = variant.images.get(id=image_id)
            image.delete()
            return True
            
        except VariantImage.DoesNotExist:
            raise ValidationError("Image not found")
        except Exception as e:
            raise ValidationError(f"Error deleting variant image: {str(e)}")
    
    @staticmethod
    def validate_variant_attributes(product, attribute_values):
        """Validate attributes cho variant (chỉ kiểm tra duplicate combination, không kiểm tra số lượng)"""
        try:
            # Chỉ kiểm tra duplicate combination
            existing = ProductVariant.objects.filter(
                product=product,
                attribute_values__in=attribute_values
            ).distinct()
            # Đảm bảo không trùng combination (tập hợp attribute value giống nhau)
            for variant in existing:
                if set(variant.attribute_values.values_list('id', flat=True)) == set([av.id for av in attribute_values]):
                    return False, "Variant combination already exists"
            return True, "Valid combination"
        except Exception as e:
            return False, f"Error validating attributes: {str(e)}"
    
    @staticmethod
    def create_variant_with_validation(product, variant_data, attribute_values):
        """Tạo variant với validation"""
        try:
            # Validate attributes
            is_valid, message = ProductVariantService.validate_variant_attributes(
                product, attribute_values
            )
            if not is_valid:
                raise ValidationError(message)
            
            # Validate variant data
            ProductService.validate_variant_data(variant_data)
            
            # Tạo variant
            variant = ProductVariant.objects.create(product=product, **variant_data)
            variant.attribute_values.set(attribute_values)
            variant.sku = variant.generate_sku()
            variant.save()
            
            return variant
            
        except Exception as e:
            raise ValidationError(f"Error creating variant: {str(e)}")
    
    @staticmethod
    def get_variant_statistics():
        """Lấy thống kê variants"""
        try:
            total_variants = ProductVariant.objects.filter(is_deleted=False).count()
            active_variants = ProductVariant.objects.filter(
                is_deleted=False,
                is_active=True
            ).count()
            
            avg_price_adjustment = ProductVariant.objects.filter(
                is_deleted=False,
                is_active=True
            ).aggregate(avg=Avg('price_adjustment'))['avg'] or 0
            
            variants_with_images = ProductVariant.objects.filter(
                is_deleted=False,
                images__isnull=False
            ).distinct().count()
            
            return {
                'total_variants': total_variants,
                'active_variants': active_variants,
                'avg_price_adjustment': avg_price_adjustment,
                'variants_with_images': variants_with_images,
            }
            
        except Exception as e:
            print(f"Error getting variant statistics: {str(e)}")
            return {} 