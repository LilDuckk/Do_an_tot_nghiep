/**
 * Hook quản lý modal chi tiết đơn hàng
 * 
 * Yêu cầu:
 * - Quản lý state modal visible, loading, form data
 * - Xử lý form validation với Ant Design Form
 * - Tích hợp với useOrderActions cho CRUD operations
 * - Xử lý product và variant selection
 * - Reset form khi đóng modal
 * - Xử lý error và success messages
 * - Tối ưu performance với useCallback
 */

import { useState, useCallback, useEffect } from 'react';
import { Form, message } from 'antd';
import { PRODUCT_ENDPOINTS, ORDER_ENDPOINTS } from '@/config/api';
import { apiCall, handleApiError } from '../utils';
import useStoreVariants from './useStoreVariants';

export default function useOrderDetailModal(selectedOrderId, refreshOrderDetails, refreshOrders, userInfo = {}) {
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Order details states
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [editingOrderDetail, setEditingOrderDetail] = useState(null);
  const [orderStoreId, setOrderStoreId] = useState(null); // Lưu store_id của đơn hàng
  
  // Product selection states
  const [products, setProducts] = useState([]);
  const [productSearchText, setProductSearchText] = useState('');
  const [coupons, setCoupons] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  
  // Store variants hook
  const { variants, loading: variantsLoading, fetchStoreVariants, getProductVariants, setVariants } = useStoreVariants();
  
  // Form reference
  const [orderDetailForm] = Form.useForm();

  // Open modal
  const openModal = useCallback((orderId, storeId = null) => {
    setModalVisible(true);
    setShowAddProductForm(false);
    setEditingOrderDetail(null);
    setSelectedProductId(null);
    setSelectedVariant(null);
    setOrderStoreId(storeId); // Lưu storeId khi mở modal
    orderDetailForm.resetFields();
  }, [orderDetailForm]);

  // Close modal
  const closeModal = useCallback(() => {
    setModalVisible(false);
    setEditingOrderDetail(null);
    setSelectedProductId(null);
    setSelectedVariant(null);
    setShowAddProductForm(false);
    orderDetailForm.resetFields();
    refreshOrderDetails();
    // Refresh danh sách đơn hàng để cập nhật thông tin mới nhất
    if (refreshOrders) {
      refreshOrders();
    }
  }, [orderDetailForm, refreshOrderDetails, refreshOrders]);

  // Fetch products
  const fetchProducts = useCallback(async (search = '') => {
    try {
      let url = PRODUCT_ENDPOINTS.PRODUCTS;
      if (search && search.trim()) {
        url += `?search=${encodeURIComponent(search.trim())}`;
      }
      const result = await apiCall(url);
      
      if (result.success && result.data) {
        setProducts(Array.isArray(result.data.results) ? result.data.results : []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, []);

  // Xử lý tìm kiếm sản phẩm
  const handleProductSearch = useCallback((searchText) => {
    setProductSearchText(searchText);
    fetchProducts(searchText);
  }, [fetchProducts]);

  // Get store ID from user info, order, hoặc form
  const getStoreId = useCallback(() => {
    // Ưu tiên lấy từ orderStoreId nếu có
    if (orderStoreId) return orderStoreId;
    // Sau đó lấy từ userInfo nếu không phải superuser
    if (userInfo && !userInfo.isSuperUser && userInfo.userStoreId) {
      return userInfo.userStoreId;
    }
    // Nếu là superuser, có thể lấy từ form hoặc để null
    return null;
  }, [orderStoreId, userInfo]);

  // Fetch variants for a product
  const fetchVariants = useCallback(async (productId, storeId = null) => {
    if (!productId) {
      return;
    }
    
    try {
      // Lấy storeId thực tế
      const realStoreId = storeId || getStoreId();
      
      // Nếu có storeId, sử dụng API store variants mới
      if (realStoreId) {
        console.log('Fetching variants with store ID:', realStoreId, 'product ID:', productId);
        await getProductVariants(realStoreId, productId);
      } else {
        // Fallback về API cũ nếu không có storeId (cho superuser)
        console.log('Using fallback API for variants, product ID:', productId);
        let url = PRODUCT_ENDPOINTS.PRODUCT_VARIANTS(productId);
        const result = await apiCall(url);
        
        if (result.success && result.data) {
          // Cập nhật variants trực tiếp từ API cũ
          setVariants(Array.isArray(result.data) ? result.data : []);
        } else {
          setVariants([]);
        }
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
      setVariants([]);
    }
  }, [getProductVariants, getStoreId, setVariants]);

  // Fetch coupons
  const fetchCoupons = useCallback(async () => {
    try {
      const result = await apiCall(ORDER_ENDPOINTS.COUPONS);
      
      if (result.success && result.data) {
        setCoupons(Array.isArray(result.data.results) ? result.data.results : []);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setCoupons([]);
    }
  }, []);

  // Handle product selection
  const handleProductChange = useCallback((productId) => {
    console.log('Product changed to:', productId);
    setSelectedProductId(productId);
    if (productId) {
      const storeId = getStoreId();
      console.log('Store ID for product change:', storeId);
      fetchVariants(productId, storeId);
    }
    orderDetailForm.setFieldsValue({ 
      product_variant: undefined,
      quantity: undefined 
    });
    setSelectedVariant(null);
  }, [fetchVariants, orderDetailForm, getStoreId]);

  // Handle variant selection
  const handleVariantChange = useCallback((variantId) => {
    console.log('Variant changed to:', variantId);
    console.log('Available variants:', variants);
    const variant = variants.find(v => v.id === variantId);
    console.log('Found variant:', variant);
    setSelectedVariant(variant);
    orderDetailForm.setFieldsValue({ quantity: 1 });
  }, [variants, orderDetailForm]);

  // Handle edit order detail
  const handleEditOrderDetail = useCallback((record) => {
    console.log('Editing order detail:', record);
    setShowAddProductForm(true);
    setEditingOrderDetail(record);
    const productId = record.variant?.product || record.product?.id;
    console.log('Product ID for edit:', productId);
    setSelectedProductId(productId);
    
    const storeId = getStoreId();
    console.log('Store ID for edit:', storeId);
    
    fetchVariants(productId, storeId).then(() => {
      console.log('Variants loaded for edit, setting form values');
      orderDetailForm.setFieldsValue({
        product: productId,
        product_variant: record.variant?.id || record.product_variant,
        quantity: record.quantity,
        coupon_id: record.coupon?.id || null,
      });
      
      // Tìm variant trong danh sách variants đã load
      const variant = variants.find(v => v.id === (record.variant?.id || record.product_variant));
      console.log('Found variant for edit:', variant);
      setSelectedVariant(variant || null);
    });
  }, [fetchVariants, orderDetailForm, getStoreId, variants]);

  // Handle add new product
  const handleAddNewProduct = useCallback(() => {
    setShowAddProductForm(true);
    setEditingOrderDetail(null);
    orderDetailForm.resetFields();
    setSelectedProductId(null);
    setSelectedVariant(null);
  }, [orderDetailForm]);

  // Handle cancel add/edit product
  const handleCancelAddProduct = useCallback(() => {
    setShowAddProductForm(false);
    orderDetailForm.resetFields();
    setSelectedProductId(null);
    setSelectedVariant(null);
    setEditingOrderDetail(null);
  }, [orderDetailForm]);

  // Initialize data when modal opens
  useEffect(() => {
    if (modalVisible) {
      fetchProducts();
      fetchCoupons();
    }
  }, [modalVisible, fetchProducts, fetchCoupons]);

  // Khi mở modal, nếu có selectedOrderId thì lấy store_id của đơn đó
  useEffect(() => {
    if (modalVisible && selectedOrderId) {
      // Gọi API lấy chi tiết đơn để lấy store_id
      (async () => {
        const res = await apiCall(`${ORDER_ENDPOINTS.ORDERS}${selectedOrderId}/`);
        if (res.success && res.data && res.data.store) {
          setOrderStoreId(res.data.store);
        }
      })();
    }
  }, [modalVisible, selectedOrderId]);

  return {
    // Modal states
    modalVisible,
    modalLoading,
    setModalVisible,
    setModalLoading,
    
    // Order details
    orderDetails,
    setOrderDetails,
    orderDetailLoading,
    setOrderDetailLoading,
    editingOrderDetail,
    setEditingOrderDetail,
    
    // Product selection
    products,
    productSearchText,
    setProductSearchText,
    handleProductSearch,
    variants,
    variantsLoading,
    coupons,
    selectedProductId,
    selectedVariant,
    showAddProductForm,
    setShowAddProductForm,
    
    // Form
    orderDetailForm,
    
    // Actions
    openModal,
    closeModal,
    handleProductChange,
    handleVariantChange,
    handleEditOrderDetail,
    handleAddNewProduct,
    handleCancelAddProduct,
    
    // Fetch functions
    fetchProducts,
    fetchVariants,
    fetchCoupons
  };
} 