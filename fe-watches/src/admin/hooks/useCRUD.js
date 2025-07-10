import { useState, useCallback } from 'react';
import { message } from 'antd';
import { useApiCall } from './useApiCall';
import { useAccessControl } from './useAccessControl';

/**
 * Hook quản lý CRUD operations chung
 * @param {object} config - Cấu hình cho CRUD
 * @param {string} config.baseUrl - URL cơ sở cho API
 * @param {string} config.entityName - Tên entity (ví dụ: 'cửa hàng', 'nhân viên')
 * @param {function} config.formatData - Function format dữ liệu trước khi gửi
 * @param {function} config.transformResponse - Function transform response từ API
 * @returns {object} - Các state và function để quản lý CRUD
 */
export const useCRUD = (config = {}) => {
  const {
    baseUrl = '',
    entityName = 'dữ liệu',
    formatData = (data) => data,
    transformResponse = (data) => data,
    pageSize = 20
  } = config;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const { get, post, put, del, isAccessError } = useApiCall();
  const { hasAccess, setHasAccess, showAccessError, checkAccessPermission } = useAccessControl();

  /**
   * Lấy danh sách dữ liệu
   * @param {object} params - Query parameters
   * @returns {Promise<boolean>} - True nếu thành công
   */
  const fetchData = useCallback(async (params = {}) => {
    if (!hasAccess) return false;
    
    try {
      setLoading(true);
      const queryParams = {
        page_size: pageSize,
        ...params
      };

      const response = await get(baseUrl, queryParams, `Lỗi khi tải danh sách ${entityName}`);
      
      if (!response.success) {
        if (response.error && isAccessError(response.error)) {
          setHasAccess(false);
          showAccessError(`Bạn không có quyền xem danh sách ${entityName}.`);
          setData([]);
          setTotal(0);
          setTotalPages(1);
          return false;
        }
        return false;
      }

      const responseData = response.data;
      const items = Array.isArray(responseData.results) ? responseData.results : [];
      const count = responseData.count || 0;

      setData(transformResponse(items));
      setTotal(count);
      setTotalPages(Math.max(1, Math.ceil(count / pageSize)));

      return true;
    } catch (error) {
      message.error(`Lỗi khi tải danh sách ${entityName}`);
      setData([]);
      setTotal(0);
      setTotalPages(1);
      return false;
    } finally {
      setLoading(false);
    }
  }, [baseUrl, entityName, pageSize, hasAccess, get, isAccessError, setHasAccess, showAccessError, transformResponse]);

  /**
   * Tạo mới dữ liệu
   * @param {object} formData - Dữ liệu form
   * @returns {Promise<boolean>} - True nếu thành công
   */
  const createData = useCallback(async (formData) => {
    try {
      const formattedData = formatData(formData);
      const response = await post(baseUrl, formattedData, `Lỗi khi tạo ${entityName} mới`);

      if (!response.success) {
        if (response.error && isAccessError(response.error)) {
          showAccessError(`Bạn không có quyền tạo ${entityName} mới.`);
          return false;
        }
        return false;
      }

      message.success(`Tạo ${entityName} mới thành công`);
      return true;
    } catch (error) {
      message.error(`Có lỗi xảy ra khi tạo ${entityName}`);
      return false;
    }
  }, [baseUrl, entityName, post, isAccessError, showAccessError, formatData]);

  /**
   * Cập nhật dữ liệu
   * @param {number} id - ID của item cần cập nhật
   * @param {object} formData - Dữ liệu form
   * @returns {Promise<boolean>} - True nếu thành công
   */
  const updateData = useCallback(async (id, formData) => {
    try {
      const formattedData = formatData(formData);
      const url = `${baseUrl}${id}/`;
      const response = await put(url, formattedData, `Lỗi khi cập nhật ${entityName}`);

      if (!response.success) {
        if (response.error && isAccessError(response.error)) {
          showAccessError(`Bạn không có quyền cập nhật ${entityName} này.`);
          return false;
        }
        return false;
      }

      message.success(`Cập nhật ${entityName} thành công`);
      return true;
    } catch (error) {
      message.error(`Có lỗi xảy ra khi cập nhật ${entityName}`);
      return false;
    }
  }, [baseUrl, entityName, put, isAccessError, showAccessError, formatData]);

  /**
   * Xóa dữ liệu
   * @param {number} id - ID của item cần xóa
   * @returns {Promise<boolean>} - True nếu thành công
   */
  const deleteData = useCallback(async (id) => {
    try {
      const url = `${baseUrl}${id}/`;
      const response = await del(url, `Lỗi khi xóa ${entityName}`);

      if (!response.success) {
        if (response.error && isAccessError(response.error)) {
          showAccessError(`Bạn không có quyền xóa ${entityName} này.`);
          return false;
        }
        return false;
      }

      message.success(`Xóa ${entityName} thành công`);
      return true;
    } catch (error) {
      message.error(`Có lỗi xảy ra khi xóa ${entityName}`);
      return false;
    }
  }, [baseUrl, entityName, del, isAccessError, showAccessError]);

  /**
   * Xử lý submit form (create hoặc update)
   * @param {object} values - Giá trị form
   * @returns {Promise<boolean>} - True nếu thành công
   */
  const handleSubmit = useCallback(async (values) => {
    let success = false;
    
    if (editingId) {
      success = await updateData(editingId, values);
    } else {
      success = await createData(values);
    }

    if (success) {
      setModalVisible(false);
      resetForm();
      // Refresh data nếu có quyền truy cập
      if (hasAccess) {
        await fetchData();
      }
    }

    return success;
  }, [editingId, updateData, createData, hasAccess, fetchData]);

  /**
   * Xử lý xóa item
   * @param {number} id - ID của item cần xóa
   * @returns {Promise<boolean>} - True nếu thành công
   */
  const handleDelete = useCallback(async (id) => {
    const success = await deleteData(id);
    
    if (success && hasAccess) {
      await fetchData();
    }

    return success;
  }, [deleteData, hasAccess, fetchData]);

  /**
   * Mở modal để tạo mới
   */
  const openCreateModal = useCallback(() => {
    setEditingId(null);
    setModalVisible(true);
  }, []);

  /**
   * Mở modal để chỉnh sửa
   * @param {number} id - ID của item cần edit
   * @param {object} initialValues - Giá trị ban đầu cho form
   */
  const openEditModal = useCallback((id, initialValues = {}) => {
    setEditingId(id);
    setModalVisible(true);
    return initialValues;
  }, []);

  /**
   * Đóng modal
   */
  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  /**
   * Reset form và modal state
   */
  const resetForm = useCallback(() => {
    setEditingId(null);
    setModalVisible(false);
  }, []);

  /**
   * Refresh dữ liệu
   * @param {object} params - Query parameters
   */
  const refreshData = useCallback(async (params = {}) => {
    if (hasAccess) {
      await fetchData(params);
    }
  }, [hasAccess, fetchData]);

  return {
    // States
    data,
    loading,
    modalVisible,
    editingId,
    total,
    totalPages,
    hasAccess,

    // Setters
    setData,
    setLoading,
    setModalVisible,
    setEditingId,
    setTotal,
    setTotalPages,

    // CRUD operations
    fetchData,
    createData,
    updateData,
    deleteData,
    handleSubmit,
    handleDelete,

    // Modal operations
    openCreateModal,
    openEditModal,
    closeModal,
    resetForm,

    // Utility
    refreshData,

    // Computed
    isEditing: !!editingId,
    canCreate: hasAccess,
    canUpdate: hasAccess,
    canDelete: hasAccess
  };
}; 