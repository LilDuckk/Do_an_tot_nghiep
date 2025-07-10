import { useState, useRef, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { getUserInfo, isSuperUser } from '@/services/userInfo';
import { getModulePermissions, hasModulePermission } from '@/services/permission';

/**
 * Hook quản lý quyền truy cập và xử lý lỗi
 * @param {string} module - Tên module cần kiểm tra quyền (ví dụ: 'user', 'product', 'order')
 * @param {string} action - Hành động cần kiểm tra (view, create, edit, delete)
 * @param {string} defaultErrorMessage - Thông báo lỗi mặc định
 * @returns {object} - Các state và function để quản lý access control
 */
export const useAccessControl = (module = null, action = 'view', defaultErrorMessage = 'Bạn không có quyền truy cập') => {
  const [hasAccess, setHasAccess] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const accessErrorShown = useRef(false);

  // Kiểm tra quyền khi component mount hoặc module/action thay đổi
  useEffect(() => {
    if (!module) {
      setHasAccess(true);
      return;
    }

    const checkPermission = () => {
      const currentUserInfo = getUserInfo();
      setUserInfo(currentUserInfo);

      // Superuser có tất cả quyền
      if (currentUserInfo.isSuperUser) {
        setHasAccess(true);
        return;
      }

      // Kiểm tra quyền cụ thể cho module và action
      const hasPermission = hasModulePermission(module, action);
      setHasAccess(hasPermission);

      // Hiển thị lỗi nếu không có quyền
      if (!hasPermission && !accessErrorShown.current) {
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

        message.error(`Bạn không có quyền ${actionText} ${moduleText}.`);
        accessErrorShown.current = true;
      }
    };

    checkPermission();
  }, [module, action]);

  /**
   * Hiển thị thông báo lỗi quyền truy cập (chỉ hiển thị 1 lần)
   * @param {string} msg - Thông báo lỗi
   */
  const showAccessError = useCallback((msg = defaultErrorMessage) => {
    if (!accessErrorShown.current) {
      message.error(msg);
      accessErrorShown.current = true;
    }
  }, [defaultErrorMessage]);

  /**
   * Kiểm tra response có phải lỗi quyền truy cập không
   * @param {Response} response - Response từ API
   * @param {string} errorMessage - Thông báo lỗi tùy chỉnh
   * @returns {boolean} - True nếu là lỗi quyền truy cập
   */
  const checkAccessPermission = useCallback((response, errorMessage) => {
    if (response.status === 403 || response.status === 401) {
      setHasAccess(false);
      showAccessError(errorMessage);
      return true;
    }
    return false;
  }, [showAccessError]);

  /**
   * Function tương thích với StoresPage.js
   * @param {boolean} hasPermission - Có quyền hay không
   * @param {string} errorMessage - Thông báo lỗi
   */
  const checkAccess = useCallback((hasPermission, errorMessage) => {
    // Chỉ set hasAccess = false khi thực sự không có quyền
    if (hasPermission === false) {
      setHasAccess(false);
      showAccessError(errorMessage);
    }
  }, [showAccessError]);

  /**
   * Kiểm tra quyền cho một module và action cụ thể
   * @param {string} moduleName - Tên module
   * @param {string} actionName - Tên action
   * @returns {boolean} - Có quyền hay không
   */
  const checkModulePermission = useCallback((moduleName, actionName = 'view') => {
    return hasModulePermission(moduleName, actionName);
  }, []);

  /**
   * Lấy thông tin quyền của module
   * @param {string} moduleName - Tên module
   * @returns {object} - Object chứa các quyền
   */
  const getModuleAccess = useCallback((moduleName) => {
    return getModulePermissions(moduleName);
  }, []);

  /**
   * Reset trạng thái access control
   */
  const resetAccessControl = useCallback(() => {
    setHasAccess(true);
    accessErrorShown.current = false;
  }, []);

  return {
    // States
    hasAccess,
    setHasAccess,
    userInfo,
    
    // Functions
    showAccessError,
    checkAccessPermission,
    checkAccess,
    checkModulePermission,
    getModuleAccess,
    resetAccessControl,
    
    // Computed
    accessErrorShown: accessErrorShown.current,
    isSuperUser: userInfo?.isSuperUser || false,
    currentUser: userInfo?.currentUser || null,
    currentEmployeeId: userInfo?.currentEmployeeId || null,
    currentStoreId: userInfo?.currentStoreId || null
  };
}; 