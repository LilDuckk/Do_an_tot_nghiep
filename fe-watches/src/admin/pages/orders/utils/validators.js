/**
 * Utility functions để validate dữ liệu đơn hàng
 * 
 * Yêu cầu:
 * - validateOrderForm: validate form đơn hàng
 * - validateCustomerInfo: validate thông tin khách hàng
 * - validateOrderItems: validate danh sách sản phẩm
 * - validatePaymentInfo: validate thông tin thanh toán
 * - validateShippingInfo: validate thông tin vận chuyển
 * - validateOrderTotal: validate tổng tiền đơn hàng
 * - validateOrderDate: validate ngày đặt hàng
 */

/**
 * Validate form đơn hàng - chỉ validate các trường bắt buộc
 */
export const validateOrderForm = (values) => {
  const errors = {};

  // Validate customer (bắt buộc)
  if (!values.customer) {
    errors.customer = 'Vui lòng chọn khách hàng';
  }

  // Validate store (bắt buộc)
  if (!values.store) {
    errors.store = 'Vui lòng chọn cửa hàng';
  }

  // Validate employee (bắt buộc)
  if (!values.employee) {
    errors.employee = 'Vui lòng chọn nhân viên';
  }

  // Các trường khác có thể để trống, chỉ validate format nếu có giá trị
  if (values.order_date && isNaN(new Date(values.order_date).getTime())) {
    errors.order_date = 'Ngày đặt hàng không hợp lệ';
  }

  // Các trường tiền tệ có thể để trống, chỉ validate format nếu có giá trị
  // subtotal và total_amount được backend tự động tính nên không cần validate
  if (values.tax !== undefined && values.tax !== '' && values.tax !== null) {
    const taxValue = parseFloat(values.tax);
    if (isNaN(taxValue) || taxValue < 0) {
      errors.tax = 'Thuế phải là số và lớn hơn hoặc bằng 0';
    }
  }

  if (values.shipping_fee !== undefined && values.shipping_fee !== '' && values.shipping_fee !== null) {
    const shippingFeeValue = parseFloat(values.shipping_fee);
    if (isNaN(shippingFeeValue) || shippingFeeValue < 0) {
      errors.shipping_fee = 'Phí vận chuyển phải là số và lớn hơn hoặc bằng 0';
    }
  }

  if (values.discount !== undefined && values.discount !== '' && values.discount !== null) {
    const discountValue = parseFloat(values.discount);
    if (isNaN(discountValue) || discountValue < 0) {
      errors.discount = 'Giảm giá phải là số và lớn hơn hoặc bằng 0';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate thông tin khách hàng
 */
export const validateCustomerInfo = (customerInfo) => {
  const errors = {};

  if (!customerInfo) {
    errors.customer = 'Thông tin khách hàng không được để trống';
    return { isValid: false, errors };
  }

  if (!customerInfo.first_name && !customerInfo.last_name) {
    errors.name = 'Tên khách hàng không được để trống';
  }

  if (!customerInfo.phone && !customerInfo.email) {
    errors.contact = 'Số điện thoại hoặc email không được để trống';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate danh sách sản phẩm
 */
export const validateOrderItems = (items) => {
  const errors = {};

  if (!items || items.length === 0) {
    errors.items = 'Đơn hàng phải có ít nhất một sản phẩm';
    return { isValid: false, errors };
  }

  items.forEach((item, index) => {
    if (!item.product_variant) {
      errors[`items.${index}.product_variant`] = 'Vui lòng chọn sản phẩm';
    }

    if (!item.quantity || item.quantity <= 0) {
      errors[`items.${index}.quantity`] = 'Số lượng phải lớn hơn 0';
    }

    if (item.unit_price !== undefined && parseFloat(item.unit_price) < 0) {
      errors[`items.${index}.unit_price`] = 'Đơn giá phải lớn hơn hoặc bằng 0';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate thông tin thanh toán - chỉ validate khi có giá trị
 */
export const validatePaymentInfo = (paymentInfo) => {
  const errors = {};

  // Chỉ validate format, không bắt buộc phải có
  if (paymentInfo.payment_method && typeof paymentInfo.payment_method !== 'string') {
    errors.payment_method = 'Phương thức thanh toán không hợp lệ';
  }

  if (paymentInfo.payment_status && typeof paymentInfo.payment_status !== 'string') {
    errors.payment_status = 'Trạng thái thanh toán không hợp lệ';
  }

  // total_amount được backend tự động tính nên không cần validate
  if (paymentInfo.total_amount !== undefined && paymentInfo.total_amount !== '' && paymentInfo.total_amount !== null) {
    const totalAmountValue = parseFloat(paymentInfo.total_amount);
    if (isNaN(totalAmountValue) || totalAmountValue < 0) {
      errors.total_amount = 'Tổng tiền phải là số và lớn hơn hoặc bằng 0';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate thông tin vận chuyển - chỉ validate khi có giá trị
 */
export const validateShippingInfo = (shippingInfo) => {
  const errors = {};

  // Chỉ validate format, không bắt buộc phải có
  if (shippingInfo.shipping_address && typeof shippingInfo.shipping_address !== 'string') {
    errors.shipping_address = 'Địa chỉ giao hàng không hợp lệ';
  }

  if (shippingInfo.shipping_method && typeof shippingInfo.shipping_method !== 'string') {
    errors.shipping_method = 'Phương thức vận chuyển không hợp lệ';
  }

  if (shippingInfo.shipping_fee !== undefined && shippingInfo.shipping_fee !== '' && shippingInfo.shipping_fee !== null) {
    const shippingFeeValue = parseFloat(shippingInfo.shipping_fee);
    if (isNaN(shippingFeeValue) || shippingFeeValue < 0) {
      errors.shipping_fee = 'Phí vận chuyển phải là số và lớn hơn hoặc bằng 0';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate tổng tiền đơn hàng - có thể để trống vì backend tự động tính
 */
export const validateOrderTotal = (total, items) => {
  const errors = {};

  // total có thể để trống vì backend tự động tính
  if (total !== undefined && total !== null && total !== '') {
    const totalAmount = parseFloat(total);
    if (isNaN(totalAmount) || totalAmount < 0) {
      errors.total = 'Tổng tiền phải là số và lớn hơn hoặc bằng 0';
    }

    // Validate với danh sách sản phẩm nếu có
    if (items && items.length > 0) {
      const calculatedTotal = items.reduce((sum, item) => {
        const itemTotal = (parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 0);
        return sum + itemTotal;
      }, 0);

      if (Math.abs(totalAmount - calculatedTotal) > 0.01) {
        errors.total = 'Tổng tiền không khớp với tổng giá trị sản phẩm';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate ngày đặt hàng - chỉ validate khi có giá trị
 */
export const validateOrderDate = (orderDate) => {
  const errors = {};

  // Chỉ validate khi có giá trị
  if (orderDate) {
    const date = new Date(orderDate);
    const now = new Date();

    if (isNaN(date.getTime())) {
      errors.order_date = 'Ngày đặt hàng không hợp lệ';
    } else if (date > now) {
      errors.order_date = 'Ngày đặt hàng không thể trong tương lai';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate thông tin sản phẩm trong chi tiết đơn hàng
 */
export const validateOrderDetailItem = (item) => {
  const errors = {};

  if (!item.product_variant) {
    errors.product_variant = 'Vui lòng chọn sản phẩm';
  }

  if (!item.quantity || item.quantity <= 0) {
    errors.quantity = 'Số lượng phải lớn hơn 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 