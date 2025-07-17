import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { REPORT_ENDPOINTS, PRODUCT_ENDPOINTS } from '@/config/api';

export const useProductPerformance = (storeId, dateRange) => {
  // Product performance
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [productPerformance, setProductPerformance] = useState(null);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [performancePeriod, setPerformancePeriod] = useState('daily');
  const [productsLoading, setProductsLoading] = useState(false);
  const [variantsLoading, setVariantsLoading] = useState(false);

  // Fetch products list for dropdown
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Try PRODUCTS endpoint first
      let res = await fetch(`${PRODUCT_ENDPOINTS.PRODUCTS}?page_size=1000&search=`, { 
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000)
      });
      
      // If not successful, try PRODUCTS_LIST_ALL
      if (!res.ok) {
        console.log('Trying PRODUCTS_LIST_ALL endpoint...');
        res = await fetch(PRODUCT_ENDPOINTS.PRODUCTS_LIST_ALL, { 
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(8000)
        });
      }
      
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      // Handle different data structures from API
      let productsList = [];
      if (data.results) {
        productsList = data.results;
      } else if (Array.isArray(data)) {
        productsList = data;
      } else if (data.products) {
        productsList = data.products;
      } else if (data.data) {
        productsList = data.data;
      }
      
      setProducts(productsList);
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Error loading products:', e); 
        message.error('Lỗi tải danh sách sản phẩm');
      }
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // Fetch variants for selected product
  const fetchVariants = useCallback(async (productId) => {
    if (!productId) {
      setVariants([]);
      setSelectedVariant(null);
      return;
    }

    setVariantsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(PRODUCT_ENDPOINTS.PRODUCT_VARIANTS(productId), { 
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000)
      });
      
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      // Handle different data structures from API
      let variantsList = [];
      if (Array.isArray(data)) {
        variantsList = data;
      } else if (data.results) {
        variantsList = data.results;
      } else if (data.variants) {
        variantsList = data.variants;
      } else if (data.data) {
        variantsList = data.data;
      }
      
      setVariants(variantsList);
      // Reset selected variant when product changes
      setSelectedVariant(null);
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error('Error loading variants:', e); 
        message.error('Lỗi tải danh sách biến thể');
      }
      setVariants([]);
      setSelectedVariant(null);
    } finally {
      setVariantsLoading(false);
    }
  }, []);

  // Fetch product performance
  const fetchProductPerformance = useCallback(async () => {
    if (!selectedVariant) return;
    
    try {
      let url = `${REPORT_ENDPOINTS.SALES_PRODUCT_PERFORMANCE_DETAIL}?product_variant_id=${selectedVariant}`;
      if (dateRange && dateRange.length === 2) {
        url += `&start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
      }
      if (storeId) url += `&store_id=${storeId}`;
      
      const token = localStorage.getItem('accessToken');
      const res = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(10000)
      });
      if (!res.ok) throw new Error('Network response was not ok');
      setProductPerformance(await res.json());
    } catch (e) { 
      if (e.name !== 'AbortError') {
        message.error('Lỗi tải hiệu suất sản phẩm'); 
      }
    }
  }, [selectedVariant, dateRange, storeId]);

  // Handle product selection
  const handleProductChange = useCallback((productId) => {
    setSelectedProduct(productId);
    setSelectedVariant(null);
    setProductPerformance(null);
    // Không gọi fetchVariants ở đây nữa, đã có useEffect quản lý
    // if (productId) {
    //   fetchVariants(productId);
    // } else {
    //   setVariants([]);
    // }
  }, []);

  // Handle variant selection
  const handleVariantChange = useCallback((variantId) => {
    setSelectedVariant(variantId);
    setProductPerformance(null);
  }, []);

  // Chỉ gọi fetchProducts 1 lần khi mount
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  // Chỉ gọi fetchVariants khi selectedProduct đổi
  useEffect(() => {
    if (selectedProduct) {
      fetchVariants(selectedProduct);
    } else {
      setVariants([]);
      setSelectedVariant(null);
    }
    // eslint-disable-next-line
  }, [selectedProduct]);

  // Chỉ gọi fetchProductPerformance khi selectedVariant, dateRange, storeId đổi
  useEffect(() => {
    if (selectedVariant) {
      fetchProductPerformance();
    }
    // eslint-disable-next-line
  }, [selectedVariant, dateRange, storeId]);

  return {
    selectedProduct,
    setSelectedProduct: handleProductChange,
    selectedVariant,
    setSelectedVariant: handleVariantChange,
    productPerformance,
    products,
    variants,
    performancePeriod,
    setPerformancePeriod,
    productsLoading,
    variantsLoading,
    fetchProducts,
    fetchVariants,
    fetchProductPerformance
  };
}; 