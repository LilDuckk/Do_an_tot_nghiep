import React from 'react';
import { Alert, Button } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { getUserInfo } from '@/services/userInfo';

/**
 * Component hiển thị thông báo không có quyền truy cập
 * @param {object} props - Props của component
 * @param {boolean} props.hasAccess - Có quyền truy cập không
 * @param {string} props.module - Tên module (ví dụ: 'user', 'product')
 * @param {string} props.action - Hành động (view, create, edit, delete)
 * @param {string} props.message - Thông báo chính
 * @param {string} props.description - Mô tả chi tiết
 * @param {object} props.style - Style cho component
 * @param {boolean} props.showUserInfo - Hiển thị thông tin user
 * @returns {JSX.Element|null} - AccessDeniedAlert component hoặc null
 */
const AccessDeniedAlert = ({
  hasAccess = true,
  module = null,
  action = 'view',
  message = null,
  description = null,
  style = { marginBottom: 16 },
  showUserInfo = true
}) => {
  if (hasAccess) {
    return null;
  }

  // Tạo thông báo mặc định nếu không có
  const defaultMessage = message || 'Không có quyền truy cập';
  
  const actionText = {
    view: 'xem',
    create: 'tạo mới',
    edit: 'chỉnh sửa',
    delete: 'xóa'
  }[action] || action;

  const moduleText = {
    user: 'người dùng',
    group: 'nhóm quyền',
    permission: 'quyền',
    product: 'sản phẩm',
    category: 'danh mục',
    brand: 'thương hiệu',
    productvariant: 'biến thể sản phẩm',
    attributetype: 'thuộc tính',
    attributevalue: 'giá trị thuộc tính',
    order: 'đơn hàng',
    returnorder: 'đơn trả hàng',
    coupon: 'mã giảm giá',
    customer: 'khách hàng',
    warranty: 'bảo hành',
    store: 'cửa hàng',
    employee: 'nhân viên',
    inventory: 'tồn kho',
    inventorytransaction: 'giao dịch kho',
    stocktake: 'kiểm kê',
    stocktransfer: 'chuyển kho',
    supplier: 'nhà cung cấp',
    purchaseorder: 'đơn đặt hàng mua',
    goodsreceipt: 'phiếu nhập hàng',
    banner: 'banner',
    contactinfo: 'thông tin liên hệ',
    footercategory: 'danh mục chân trang',
    footerlink: 'liên kết chân trang',
    news: 'tin tức',
    auditlog: 'lịch sử thao tác'
  }[module] || module;

  const defaultDescription = description || 
    (module ? 
      `Bạn không có quyền ${actionText} ${moduleText}. Vui lòng liên hệ quản trị viên để được cấp quyền.` :
      'Bạn không có quyền xem hoặc thực hiện các thao tác trên trang này. Vui lòng liên hệ quản trị viên để được cấp quyền.'
    );

  // Lấy thông tin user nếu cần
  const userInfo = showUserInfo ? getUserInfo() : null;

  return (
    <Alert
      message={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LockOutlined style={{ color: '#ff4d4f' }} />
          <span>{defaultMessage}</span>
        </div>
      }
      description={
        <div>
          <p>{defaultDescription}</p>
          {showUserInfo && userInfo && (
            <div style={{ 
              marginTop: 12, 
              padding: 8, 
              background: '#f6f6f6', 
              borderRadius: 4,
              fontSize: '12px',
              color: '#666'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <UserOutlined />
                <strong>Thông tin tài khoản:</strong>
              </div>
              <div>Tài khoản: {userInfo.currentUser?.username || 'N/A'}</div>
              <div>Vai trò: {userInfo.isSuperUser ? 'Quản trị viên' : 'Nhân viên'}</div>
              {userInfo.currentEmployeeId && (
                <div>Mã nhân viên: {userInfo.currentEmployeeId}</div>
              )}
              {userInfo.currentStoreId && (
                <div>Cửa hàng: {userInfo.currentStoreId}</div>
              )}
            </div>
          )}
        </div>
      }
      type="error"
      showIcon={false}
      style={style}
      action={
        <Button 
          size="small" 
          type="primary" 
          danger
          onClick={() => window.history.back()}
        >
          Quay lại
        </Button>
      }
    />
  );
};

export default AccessDeniedAlert; 