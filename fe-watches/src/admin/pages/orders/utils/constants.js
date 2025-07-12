/**
 * Constants cho Orders
 * 
 * Yêu cầu:
 * - ORDER_STATUSES: các trạng thái đơn hàng
 * - PAYMENT_STATUSES: các trạng thái thanh toán
 * - PAYMENT_METHODS: các phương thức thanh toán
 * - SHIPPING_METHODS: các phương thức vận chuyển
 * - ORDER_TYPES: các loại đơn hàng
 * - TABLE_COLUMNS: cấu hình cột bảng
 * - FORM_RULES: rules validation cho form
 */

/**
 * Các trạng thái đơn hàng
 */
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

/**
 * Các trạng thái thanh toán
 */
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed'
};

/**
 * Các phương thức thanh toán
 */
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  BANK_TRANSFER: 'bank_transfer'
};

/**
 * Các phương thức vận chuyển
 */
export const SHIPPING_METHODS = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  OVERNIGHT: 'overnight'
};

/**
 * Các loại đơn hàng
 */
export const ORDER_TYPES = {
  ONLINE: true,
  OFFLINE: false
};

/**
 * Options cho Select components
 */
export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipped', label: 'Đã giao hàng' },
  { value: 'delivered', label: 'Đã nhận hàng' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Tiền mặt' },
  { value: 'credit_card', label: 'Thẻ tín dụng' },
  { value: 'bank_transfer', label: 'Chuyển khoản' },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'failed', label: 'Thanh toán thất bại' },
];

export const SHIPPING_METHOD_OPTIONS = [
  { value: 'standard', label: 'Tiêu chuẩn' },
  { value: 'express', label: 'Nhanh' },
];

export const ONLINE_ORDER_OPTIONS = [
  { value: true, label: 'Có' },
  { value: false, label: 'Không' },
];

/**
 * Cấu hình cột bảng chính
 */
export const MAIN_TABLE_COLUMNS = {
  ID: { title: 'Mã đơn', dataIndex: 'id', key: 'id', width: 80 },
  CUSTOMER: { title: 'Khách hàng', dataIndex: 'customer_first_name', key: 'customer_first_name', width: 150 },
  STORE: { title: 'Cửa hàng', dataIndex: 'store_name', key: 'store_name', width: 120 },
  STATUS: { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120 },
  PAYMENT_METHOD: { title: 'Phương thức thanh toán', dataIndex: 'payment_method', key: 'payment_method', width: 140 },
  TOTAL_AMOUNT: { title: 'Tổng tiền', dataIndex: 'total_amount', key: 'total_amount', width: 120, align: 'right' },
  CREATED_AT: { title: 'Ngày tạo', dataIndex: 'created_at', key: 'created_at', width: 140 },
  EMPLOYEE: { title: 'Nhân viên', dataIndex: 'employee', key: 'employee', width: 120 },
  ACTIONS: { title: 'Thao tác', key: 'action', width: 200, fixed: 'right' }
};

/**
 * Cấu hình cột bảng chi tiết đơn hàng
 */
export const ORDER_DETAIL_COLUMNS = {
  PRODUCT: { title: 'Sản phẩm', dataIndex: 'variant', key: 'product_name', width: 200 },
  WARRANTY: { title: 'Bảo hành', dataIndex: 'warranty_info', key: 'warranty', width: 150 },
  QUANTITY: { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', width: 80, align: 'center' },
  UNIT_PRICE: { title: 'Đơn giá', dataIndex: 'unit_price', key: 'unit_price', width: 120, align: 'right' },
  FINAL_PRICE: { title: 'Thành tiền', dataIndex: 'final_price', key: 'final_price', width: 130, align: 'right' },
  ACTIONS: { title: 'Thao tác', key: 'action', width: 120, fixed: 'right' }
};

/**
 * Cấu hình cột bảng đơn hàng chưa gán
 */
export const UNASSIGNED_ORDER_COLUMNS = {
  ID: { title: 'Mã đơn', dataIndex: 'id', key: 'id', width: 80 },
  CUSTOMER: { title: 'Khách hàng', dataIndex: 'customer_first_name', key: 'customer_first_name', width: 150 },
  SHIPPING_ADDRESS: { title: 'Địa chỉ giao hàng', dataIndex: 'shipping_address', key: 'shipping_address', width: 200 },
  NOTE: { title: 'Ghi chú', dataIndex: 'note', key: 'note', width: 150 },
  STATUS: { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120 },
  TOTAL_AMOUNT: { title: 'Tổng tiền', dataIndex: 'total_amount', key: 'total_amount', width: 120, align: 'right' },
  CREATED_AT: { title: 'Ngày tạo', dataIndex: 'created_at', key: 'created_at', width: 140 },
  ACTIONS: { title: 'Thao tác', key: 'action', width: 150, fixed: 'right' }
};

/**
 * Rules validation cho form - chỉ bắt buộc các trường cần thiết
 */
export const FORM_RULES = {
  customer: [
    { required: true, message: 'Vui lòng chọn khách hàng' }
  ],
  store: [
    { required: true, message: 'Vui lòng chọn cửa hàng' }
  ],
  employee: [
    { required: true, message: 'Vui lòng chọn nhân viên' }
  ],
  order_date: [
    { type: 'object', message: 'Ngày đặt hàng không hợp lệ' }
  ],
  status: [
    { type: 'string', message: 'Trạng thái không hợp lệ' }
  ],
  payment_method: [
    { type: 'string', message: 'Phương thức thanh toán không hợp lệ' }
  ],
  payment_status: [
    { type: 'string', message: 'Trạng thái thanh toán không hợp lệ' }
  ],
  shipping_address: [
    { type: 'string', message: 'Địa chỉ giao hàng không hợp lệ' }
  ],
  shipping_method: [
    { type: 'string', message: 'Phương thức vận chuyển không hợp lệ' }
  ],
  // Các trường tiền tệ có thể để trống, chỉ validate format nếu có giá trị
  // subtotal và total_amount được backend tự động tính nên không cần validate
  subtotal: [
    // Không bắt buộc vì backend tự động tính
  ],
  tax: [
    // Không bắt buộc, chỉ validate format nếu có giá trị
    { 
      validator: (_, value) => {
        if (value === undefined || value === null || value === '') {
          return Promise.resolve();
        }
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
          return Promise.reject(new Error('Thuế phải là số và lớn hơn hoặc bằng 0'));
        }
        return Promise.resolve();
      }
    }
  ],
  shipping_fee: [
    // Không bắt buộc, chỉ validate format nếu có giá trị
    { 
      validator: (_, value) => {
        if (value === undefined || value === null || value === '') {
          return Promise.resolve();
        }
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
          return Promise.reject(new Error('Phí vận chuyển phải là số và lớn hơn hoặc bằng 0'));
        }
        return Promise.resolve();
      }
    }
  ],
  discount: [
    // Không bắt buộc, chỉ validate format nếu có giá trị
    { 
      validator: (_, value) => {
        if (value === undefined || value === null || value === '') {
          return Promise.resolve();
        }
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
          return Promise.reject(new Error('Giảm giá phải là số và lớn hơn hoặc bằng 0'));
        }
        return Promise.resolve();
      }
    }
  ],
  total_amount: [
    // Không bắt buộc vì backend tự động tính
  ]
}; 