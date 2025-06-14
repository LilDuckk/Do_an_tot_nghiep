// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  GROUPS: `${API_BASE_URL}/account/auth/groups`,
  PERMISSIONS: `${API_BASE_URL}/account/auth/permissions`,
  LOGIN: `${API_BASE_URL}/account/auth/login`,
  REFRESH_TOKEN: `${API_BASE_URL}/account/auth/refresh`,
  LOGOUT: `${API_BASE_URL}/account/auth/logout`,
  ME: `${API_BASE_URL}/account/auth/me`,
};

// User endpoints
export const USER_ENDPOINTS = {
  USERS: `${API_BASE_URL}/account/users`,
  USERS_ALL: `${API_BASE_URL}/account/users/all`,
  USER_DETAIL: (id) => `${API_BASE_URL}/account/users/${id}/`,
  USER_GROUPS: (id) => `${API_BASE_URL}/account/users/${id}/groups`,
  USER_PERMISSIONS: (id) => `${API_BASE_URL}/account/users/${id}/permissions`,
};

// Store endpoints
export const STORE_ENDPOINTS = {
  STORES: `${API_BASE_URL}/stores/stores`,
  STORES_LIST_ALL: `${API_BASE_URL}/stores/stores/list_all`,
  STORE_DETAIL: (id) => `${API_BASE_URL}/stores/stores/${id}/`,
  STORE_EMPLOYEE_COUNT: (id) => `${API_BASE_URL}/stores/stores/${id}/employee_count`,
};

// Employee endpoints
export const EMPLOYEE_ENDPOINTS = {
  EMPLOYEES: `${API_BASE_URL}/stores/employees`,
  EMPLOYEES_LIST_ALL: `${API_BASE_URL}/stores/employees/list_all`,
  EMPLOYEE_DETAIL: (id) => `${API_BASE_URL}/stores/employees/${id}/`,
};

// Product endpoints
export const PRODUCT_ENDPOINTS = {
  // Products
  PRODUCTS: `${API_BASE_URL}/products/products`,
  PRODUCTS_LIST_ALL: `${API_BASE_URL}/products/products/list_all`,
  PRODUCT_FEATURED: `${API_BASE_URL}/products/products/featured`,
  PRODUCT_DETAIL: (id) => `${API_BASE_URL}/products/products/${id}/`,
  PRODUCT_BULK_UPDATE_VARIANTS: (id) => `${API_BASE_URL}/products/products/${id}/bulk_update_variants`,
  PRODUCT_ATTRIBUTES: (id) => `${API_BASE_URL}/products/products/${id}/get_attributes`,
  PRODUCT_VARIANTS: (id) => `${API_BASE_URL}/products/products/${id}/get_variants`,
  PRODUCT_SET_PRIMARY_IMAGE: (id) => `${API_BASE_URL}/products/products/${id}/set_primary_image`,

  // Categories
  CATEGORIES: `${API_BASE_URL}/products/categories`,
  CATEGORIES_LIST_ALL: `${API_BASE_URL}/products/categories/list_all`,
  CATEGORY_DETAIL: (id) => `${API_BASE_URL}/products/categories/${id}/`,

  // Brands
  BRANDS: `${API_BASE_URL}/products/brands`,
  BRANDS_LIST_ALL: `${API_BASE_URL}/products/brands/list_all`,
  BRAND_DETAIL: (id) => `${API_BASE_URL}/products/brands/${id}/`,

  // Attribute Types
  ATTRIBUTE_TYPES: `${API_BASE_URL}/products/attribute-types`,
  ATTRIBUTE_TYPES_LIST_ALL: `${API_BASE_URL}/products/attribute-types/list_all`,
  ATTRIBUTE_TYPE_DETAIL: (id) => `${API_BASE_URL}/products/attribute-types/${id}/`,

  // Attribute Values
  ATTRIBUTE_VALUES: `${API_BASE_URL}/products/attribute-values`,
  ATTRIBUTE_VALUES_LIST_ALL: `${API_BASE_URL}/products/attribute-values/list_all`,
  ATTRIBUTE_VALUE_DETAIL: (id) => `${API_BASE_URL}/products/attribute-values/${id}/`,

  // Product Images
  PRODUCT_IMAGES: `${API_BASE_URL}/products/product-images`,
  PRODUCT_IMAGE_DETAIL: (id) => `${API_BASE_URL}/products/product-images/${id}/`,

  // Variants
  VARIANTS: `${API_BASE_URL}/products/variants`,
  VARIANTS_LIST_ALL: `${API_BASE_URL}/products/variants/list_all`,
  VARIANT_DETAIL: (id) => `${API_BASE_URL}/products/variants/${id}/`,
  VARIANT_DELETE_IMAGE: (id) => `${API_BASE_URL}/products/variants/${id}/delete_image/`,
  VARIANT_UPLOAD_IMAGES: (id) => `${API_BASE_URL}/products/variants/${id}/upload_images/`,

  // Variant Images
  VARIANT_IMAGES: `${API_BASE_URL}/products/variant-images`,
  VARIANT_IMAGE_DETAIL: (id) => `${API_BASE_URL}/products/variant-images/${id}/`,
};

// Order endpoints
export const ORDER_ENDPOINTS = {
  ORDERS: `${API_BASE_URL}/orders`,
  ORDER_DETAIL: (id) => `${API_BASE_URL}/orders/${id}/`,
  ORDER_STATUS: (id) => `${API_BASE_URL}/orders/${id}/status`,
  CUSTOMERS: `${API_BASE_URL}/orders/customers`,
  CUSTOMER_DETAIL: (id) => `${API_BASE_URL}/orders/customers/${id}/`,
};

// Inventory endpoints
export const INVENTORY_ENDPOINTS = {
  INVENTORIES: `${API_BASE_URL}/inventory/inventories`,
  INVENTORY_DETAIL: (id) => `${API_BASE_URL}/inventory/inventories/${id}/`,
};

// Content endpoints
export const CONTENT_ENDPOINTS = {
  BANNERS: `${API_BASE_URL}/content/banners`,
  BANNERS_ALL: `${API_BASE_URL}/content/banners/all`,
  BANNER_DETAIL: (id) => `${API_BASE_URL}/content/banners/${id}/`,
  FOOTER_LINKS: `${API_BASE_URL}/content/footer-links`,
  FOOTER_LINKS_ALL: `${API_BASE_URL}/content/footer-links/all`,
  FOOTER_LINK_DETAIL: (id) => `${API_BASE_URL}/content/footer-links/${id}/`,
  FOOTER_CATEGORIES: `${API_BASE_URL}/content/footer-categories`,
  FOOTER_CATEGORIES_ALL: `${API_BASE_URL}/content/footer-categories/all`,
  FOOTER_CATEGORY_DETAIL: (id) => `${API_BASE_URL}/content/footer-categories/${id}/`,
};

// Core endpoints
export const CORE_ENDPOINTS = {
  AUDIT_LOGS: `${API_BASE_URL}/core/audit-logs`,
  USERS: `${API_BASE_URL}/account/users`,
};

// Export base URL nếu cần sử dụng riêng lẻ
export { API_BASE_URL }; 