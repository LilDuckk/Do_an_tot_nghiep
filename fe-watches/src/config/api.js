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
  USERS: `${API_BASE_URL}/account/users/`,
  USERS_ALL: `${API_BASE_URL}/account/users/all`,
  USER_DETAIL: (id) => `${API_BASE_URL}/account/users/${id}/`,
  USER_GROUPS: (id) => `${API_BASE_URL}/account/users/${id}/groups`,
  USER_PERMISSIONS: (id) => `${API_BASE_URL}/account/users/${id}/permissions`,
};

// Store endpoints
export const STORE_ENDPOINTS = {
  STORES: `${API_BASE_URL}/stores/stores`,
  STORES_LIST_ALL: `${API_BASE_URL}/stores/stores/list_all`,
  STORE_EMPLOYEE_COUNT: (id) => `${API_BASE_URL}/stores/stores/${id}/employee_count`,
  STORE_DETAIL: (id) => `${API_BASE_URL}/stores/stores/${id}/`,
  EMPLOYEES: `${API_BASE_URL}/stores/employees`,
  EMPLOYEES_LIST_ALL: `${API_BASE_URL}/stores/employees/list_all`,
  EMPLOYEE_DETAIL: (id) => `${API_BASE_URL}/stores/employees/${id}/`,
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
  PRODUCTS: `${API_BASE_URL}/products/products/`,
  PRODUCTS_LIST_ALL: `${API_BASE_URL}/products/products/list_all`,
  PRODUCT_FEATURED: `${API_BASE_URL}/products/products/featured`,
  PRODUCT_DETAIL: (id) => `${API_BASE_URL}/products/products/${id}/`,
  PRODUCT_BULK_UPDATE_VARIANTS: (id) => `${API_BASE_URL}/products/products/${id}/bulk_update_variants`,
  PRODUCT_ATTRIBUTES: (id) => `${API_BASE_URL}/products/products/${id}/get_attributes`,
  PRODUCT_VARIANTS: (id) => `${API_BASE_URL}/products/products/${id}/get_variants`,
  PRODUCT_SET_PRIMARY_IMAGE: (id) => `${API_BASE_URL}/products/products/${id}/set_primary_image`,

  // Categories
  CATEGORIES: `${API_BASE_URL}/products/categories/`,
  CATEGORIES_LIST_ALL: `${API_BASE_URL}/products/categories/list_all`,
  CATEGORY_DETAIL: (id) => `${API_BASE_URL}/products/categories/${id}/`,

  // Brands
  BRANDS: `${API_BASE_URL}/products/brands/`,
  BRANDS_LIST_ALL: `${API_BASE_URL}/products/brands/list_all`,
  BRAND_DETAIL: (id) => `${API_BASE_URL}/products/brands/${id}/`,

  // Attribute Types
  ATTRIBUTE_TYPES: `${API_BASE_URL}/products/attribute-types/`,
  ATTRIBUTE_TYPES_LIST_ALL: `${API_BASE_URL}/products/attribute-types/list_all`,
  ATTRIBUTE_TYPE_DETAIL: (id) => `${API_BASE_URL}/products/attribute-types/${id}/`,

  // Attribute Values
  ATTRIBUTE_VALUES: `${API_BASE_URL}/products/attribute-values/`,
  ATTRIBUTE_VALUES_LIST_ALL: `${API_BASE_URL}/products/attribute-values/list_all`,
  ATTRIBUTE_VALUE_DETAIL: (id) => `${API_BASE_URL}/products/attribute-values/${id}/`,

  // Product Images
  PRODUCT_IMAGES: `${API_BASE_URL}/products/product-images/`,
  PRODUCT_IMAGE_DETAIL: (id) => `${API_BASE_URL}/products/product-images/${id}/`,

  // Variants
  VARIANTS: `${API_BASE_URL}/products/variants`,
  VARIANTS_LIST_ALL: `${API_BASE_URL}/products/variants/list_all/`,
  VARIANT_DETAIL: (id) => `${API_BASE_URL}/products/variants/${id}/`,
  VARIANT_DELETE_IMAGE: (id) => `${API_BASE_URL}/products/variants/${id}/delete_image/`,
  VARIANT_UPLOAD_IMAGES: (id) => `${API_BASE_URL}/products/variants/${id}/upload_images/`,

  // Variant Images
  VARIANT_IMAGES: `${API_BASE_URL}/products/variant-images`,
  VARIANT_IMAGE_DETAIL: (id) => `${API_BASE_URL}/products/variant-images/${id}/`,
};

// Order endpoints
export const ORDER_ENDPOINTS = {
  ORDERS: `${API_BASE_URL}/orders/orders/`,
  ORDER_DETAIL: (id) => `${API_BASE_URL}/orders/orders/${id}/`,
  ORDER_STATUS: (id) => `${API_BASE_URL}/orders/orders/${id}/status`,
  ORDER_DETAILS: `${API_BASE_URL}/orders/order-details/`,
  ORDER_DETAIL_ITEM: (id) => `${API_BASE_URL}/orders/order-details/${id}/`,
  COUPONS: `${API_BASE_URL}/orders/coupons/`,
  COUPON_DETAIL: (id) => `${API_BASE_URL}/orders/coupons/${id}/`,
  ORDER_PROCESS: (id) => `${API_BASE_URL}/orders/orders/${id}/process_order/`,
  ORDER_SHIP: (id) => `${API_BASE_URL}/orders/orders/${id}/ship_order/`,
  ORDER_CONFIRM: (id) => `${API_BASE_URL}/orders/orders/${id}/confirm_order/`,
  ORDER_CANCEL: (id) => `${API_BASE_URL}/orders/orders/${id}/cancel_order/`,
  CREATE_COMPLETE_ORDER: `${API_BASE_URL}/orders/create-complete-order/`,
  // API cho đơn hàng chưa gán cửa hàng
  UNASSIGNED_ORDERS: `${API_BASE_URL}/orders/unassigned-orders/`,
  ASSIGN_ORDER: (orderId) => `${API_BASE_URL}/orders/assign-order/${orderId}/`,
  MY_STORE_ORDERS: `${API_BASE_URL}/orders/my-store-orders/`,
};

// Customer endpoints
export const CUSTOMER_ENDPOINTS = {
  CUSTOMERS: `${API_BASE_URL}/orders/customers/`,
  CUSTOMER_DETAIL: (id) => `${API_BASE_URL}/orders/customers/${id}/`,
};

// Inventory endpoints
export const INVENTORY_ENDPOINTS = {
  INVENTORIES: `${API_BASE_URL}/inventory/inventories/`,
  INVENTORY_DETAIL: (id) => `${API_BASE_URL}/inventory/inventories/${id}/`,
  // Inventory Transactions
  INVENTORY_TRANSACTIONS: `${API_BASE_URL}/inventory/inventory-transactions/`,
  INVENTORY_TRANSACTION_DETAIL: (id) => `${API_BASE_URL}/inventory/inventory-transactions/${id}/`,
  INVENTORY_TRANSACTION_SUMMARY: (id) => `${API_BASE_URL}/inventory/inventory-transactions/${id}/transaction_summary/`,
  
  // Stock Takes
  STOCK_TAKES: `${API_BASE_URL}/inventory/stock-takes/`,
  STOCK_TAKE_DETAIL: (id) => `${API_BASE_URL}/inventory/stock-takes/${id}/`,
  STOCK_TAKE_SUMMARY: (id) => `${API_BASE_URL}/inventory/stock-takes/${id}/summary/`,
  
  // Stock Transfers
  STOCK_TRANSFERS: `${API_BASE_URL}/inventory/stock-transfers/`,
  STOCK_TRANSFER_DETAIL: (id) => `${API_BASE_URL}/inventory/stock-transfers/${id}/`,
  STOCK_TRANSFER_SUMMARY: (id) => `${API_BASE_URL}/inventory/stock-transfers/${id}/summary/`,
  STOCK_TRANSFER_CONFIRM: (id) => `${API_BASE_URL}/inventory/stock-transfers/${id}/confirm_transfer/`,
  STOCK_TRANSFER_CANCEL: (id) => `${API_BASE_URL}/inventory/stock-transfers/${id}/cancel_transfer/`,
  STOCK_TRANSFER_STATISTICS: `${API_BASE_URL}/inventory/stock-transfers/statistics/`,
  
  // Stock Transfer Details
  STOCK_TRANSFER_DETAILS: `${API_BASE_URL}/inventory/stock-transfer-details/`,
  STOCK_TRANSFER_DETAIL_ITEM: (id) => `${API_BASE_URL}/inventory/stock-transfer-details/${id}/`,
  
  // Inventory Management APIs
  STORE_INVENTORY: `${API_BASE_URL}/inventory/inventories/store_inventory/`,
  STORE_STATISTICS: `${API_BASE_URL}/inventory/inventories/store_statistics/`,
  PRODUCT_SEARCH: `${API_BASE_URL}/inventory/inventories/product_search/`,
  LOW_STOCK_ALERT: `${API_BASE_URL}/inventory/inventories/low_stock_alert/`,
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

// Supplier endpoints
export const SUPPLIER_ENDPOINTS = {
  SUPPLIERS: `${API_BASE_URL}/stores/suppliers/`,
  SUPPLIERS_LIST_ALL: `${API_BASE_URL}/stores/suppliers/list_all/`,
  SUPPLIER_DETAIL: (id) => `${API_BASE_URL}/stores/suppliers/${id}/`,
};

// Purchase endpoints
export const PURCHASE_ENDPOINTS = {
  // Purchase Orders
  PURCHASE_ORDERS: `${API_BASE_URL}/purchases/purchase-orders/`,
  PURCHASE_ORDER_DETAIL: (id) => `${API_BASE_URL}/purchases/purchase-orders/${id}/`,
  PURCHASE_ORDER_CONFIRM: (id) => `${API_BASE_URL}/purchases/purchase-orders/${id}/confirm_order/`,
  PURCHASE_ORDER_CANCEL: (id) => `${API_BASE_URL}/purchases/purchase-orders/${id}/cancel_order/`,
  PURCHASE_ORDER_STATISTICS: (id) => `${API_BASE_URL}/purchases/purchase-orders/${id}/statistics/`,
  PURCHASE_ORDERS_WITHOUT_RECEIPT: `${API_BASE_URL}/purchases/purchase-orders/get_orders_without_receipt/`,
  
  // Purchase Order Details
  PURCHASE_ORDER_DETAILS: `${API_BASE_URL}/purchases/purchase-order-details/`,
  PURCHASE_ORDER_DETAIL_ITEM: (id) => `${API_BASE_URL}/purchases/purchase-order-details/${id}/`,
  
  // Goods Receipts
  GOODS_RECEIPTS: `${API_BASE_URL}/purchases/goods-receipts/`,
  GOODS_RECEIPT_DETAIL: (id) => `${API_BASE_URL}/purchases/goods-receipts/${id}/`,
  GOODS_RECEIPT_CONFIRM: (id) => `${API_BASE_URL}/purchases/goods-receipts/${id}/confirm_receipt/`,
  GOODS_RECEIPT_UPDATE_INVENTORY: (id) => `${API_BASE_URL}/purchases/goods-receipts/${id}/update_inventory/`,
  GOODS_RECEIPT_CREATE_FROM_PO: `${API_BASE_URL}/purchases/goods-receipts/create_from_purchase_order/`,
  
  // New Goods Receipt endpoints from exp.txt
  GOODS_RECEIPT_QUANTITY_VARIANCE: (id) => `${API_BASE_URL}/purchases/goods-receipts/${id}/quantity_variance/`,
  GOODS_RECEIPT_FINANCIAL_VARIANCE: (id) => `${API_BASE_URL}/purchases/goods-receipts/${id}/financial_variance/`,
  GOODS_RECEIPT_QUALITY_ISSUES: (id) => `${API_BASE_URL}/purchases/goods-receipts/${id}/quality_issues/`,
  GOODS_RECEIPT_AVAILABLE_POS: `${API_BASE_URL}/purchases/goods-receipts/get_available_purchase_orders/`,
  GOODS_RECEIPT_PO_INFO: `${API_BASE_URL}/purchases/goods-receipts/get_purchase_order_info/`,
  GOODS_RECEIPT_GET_DETAILS: (id) => `${API_BASE_URL}/purchases/goods-receipts/${id}/get_receipt_details/`,
  GOODS_RECEIPT_SUMMARY: (id) => `${API_BASE_URL}/purchases/goods-receipts/${id}/get_receipt_summary/`,
  GOODS_RECEIPT_UPDATE_QUANTITIES: (id) => `${API_BASE_URL}/purchases/goods-receipts/${id}/update_received_quantities/`,
  GOODS_RECEIPT_UPDATE_PRICES: (id) => `${API_BASE_URL}/purchases/goods-receipts/${id}/update_prices_from_purchase_order/`,

  // Goods Receipt Details
  GOODS_RECEIPT_DETAILS: `${API_BASE_URL}/purchases/goods-receipt-details/`,
  GOODS_RECEIPT_DETAIL_ITEM: (id) => `${API_BASE_URL}/purchases/goods-receipt-details/${id}/`,
};

// Report endpoints - Cập nhật theo exp2.txt
export const REPORT_ENDPOINTS = {
  // Dashboard APIs
  DASHBOARD_OVERVIEW: `${API_BASE_URL}/reports/dashboard/overview/`,
  DASHBOARD_RECENT_ACTIVITY: `${API_BASE_URL}/reports/dashboard/recent_activity/`,
  DASHBOARD_ALERTS: `${API_BASE_URL}/reports/dashboard/alerts/`,
  
  // Sales Analysis APIs
  SALES_BEST_SELLERS: `${API_BASE_URL}/reports/sales/best_sellers/`,
  SALES_PERFORMANCE_BY_TIME: `${API_BASE_URL}/reports/sales/sales_performance_by_time/`,
  SALES_INVENTORY_TURNOVER: `${API_BASE_URL}/reports/sales/inventory_turnover/`,
  
  // Revenue Report APIs
  REVENUE_DAILY: `${API_BASE_URL}/reports/revenue/daily_revenue/`,
  REVENUE_MONTHLY: `${API_BASE_URL}/reports/revenue/monthly_revenue/`,
  REVENUE_PROFIT_ANALYSIS: `${API_BASE_URL}/reports/revenue/profit_analysis/`,
  
  // Return & Warranty Report APIs
  RETURN_SUMMARY: `${API_BASE_URL}/reports/return-warranty-report/return_summary/`,
  WARRANTY_SUMMARY: `${API_BASE_URL}/reports/return-warranty-report/warranty_summary/`,
  FINANCIAL_IMPACT: `${API_BASE_URL}/reports/return-warranty-report/financial_impact/`,
  
  // Daily Revenue APIs
  DAILY_REVENUE_CALCULATE: `${API_BASE_URL}/reports/daily-revenue/calculate_daily_revenue/`,
  DAILY_REVENUE_INVENTORY_ANALYSIS: `${API_BASE_URL}/reports/daily-revenue/inventory_analysis/`,
  DAILY_REVENUE_FORECAST: `${API_BASE_URL}/reports/daily-revenue/revenue_forecast/`,
  
  // Top Performance APIs
  TOP_PRODUCTS: `${API_BASE_URL}/reports/top-products/`,
  TOP_CUSTOMERS: `${API_BASE_URL}/reports/top-customers/`,
  BEST_SELLING: `${API_BASE_URL}/reports/best-selling/`,
};

// Warranty endpoints
export const WARRANTY_ENDPOINTS = {
  // Warranty CRUD
  WARRANTIES: `${API_BASE_URL}/warranties/`,
  WARRANTY_DETAIL: (id) => `${API_BASE_URL}/warranties/${id}/`,
  
  // Warranty Statistics
  WARRANTY_STATISTICS: `${API_BASE_URL}/warranties/statistics/`,
  WARRANTY_EXPIRING_SOON: `${API_BASE_URL}/warranties/expiring-soon/`,
  
  // Warranty Custom Actions
  WARRANTY_EXTEND: (id) => `${API_BASE_URL}/warranties/${id}/extend/`,
  WARRANTY_CREATE_CLAIM: (id) => `${API_BASE_URL}/warranties/${id}/create-claim/`,
  WARRANTY_REMAINING_DAYS: (id) => `${API_BASE_URL}/warranties/${id}/remaining-days/`,
  
  // Warranty Bulk Operations
  WARRANTY_BULK_UPDATE: `${API_BASE_URL}/warranties/bulk-update/`,
  WARRANTY_BULK_DELETE: `${API_BASE_URL}/warranties/bulk-delete/`,
  
  // Warranty Export/Import
  WARRANTY_EXPORT: `${API_BASE_URL}/warranties/export/`,
  WARRANTY_IMPORT: `${API_BASE_URL}/warranties/import/`,
  
  // Order Warranty
  ORDER_WARRANTIES: (orderId) => `${API_BASE_URL}/orders/${orderId}/warranties/`,
  ORDER_DETAIL_WARRANTY: (orderId, orderDetailId) => `${API_BASE_URL}/orders/${orderId}/order-details/${orderDetailId}/warranty/`,
};

// Return Order endpoints
export const RETURN_ORDER_ENDPOINTS = {
  // Return Order CRUD
  RETURN_ORDERS: `${API_BASE_URL}/orders/return-orders/`,
  RETURN_ORDER_DETAIL: (id) => `${API_BASE_URL}/orders/return-orders/${id}/`,
  
  // Return Order Actions
  RETURN_ORDER_APPROVE: (id) => `${API_BASE_URL}/orders/return-orders/${id}/approve/`,
  RETURN_ORDER_REJECT: (id) => `${API_BASE_URL}/orders/return-orders/${id}/reject/`,
  RETURN_ORDER_COMPLETE: (id) => `${API_BASE_URL}/orders/return-orders/${id}/complete/`,
  
  // Return Order Details
  RETURN_ORDER_DETAILS: `${API_BASE_URL}/orders/return-order-details/`,
  RETURN_ORDER_DETAIL_ITEM: (id) => `${API_BASE_URL}/orders/return-order-details/${id}/`,
  
  // Return Order Statistics
  RETURN_ORDER_STATISTICS: `${API_BASE_URL}/orders/return-orders/statistics/`,
  
  // Return Order Utilities
  RETURN_ORDER_ORDER_DETAILS: (id) => `${API_BASE_URL}/orders/return-orders/${id}/order_details/`,
};

// Export base URL nếu cần sử dụng riêng lẻ
export { API_BASE_URL }; 