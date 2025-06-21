import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Tag, message, Modal, Form, Select, DatePicker, Card, Row, Col, Popconfirm, InputNumber } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { PURCHASE_ENDPOINTS, SUPPLIER_ENDPOINTS, STORE_ENDPOINTS, EMPLOYEE_ENDPOINTS, PRODUCT_ENDPOINTS } from '../../config/api';
import '../static/AdminCommon.css';
import dayjs from 'dayjs';

const { confirm } = Modal;
const { RangePicker } = DatePicker;

// Hàm lấy string đầu tiên từ object/array
function extractFirstString(obj) {
  if (typeof obj === 'string') return obj;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = extractFirstString(item);
      if (found) return found;
    }
  }
  if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      const found = extractFirstString(obj[key]);
      if (found) return found;
    }
  }
  return null;
}

const GoodsReceiptsPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [showFilters, setShowFilters] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [stores, setStores] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [supplierFilter, setSupplierFilter] = useState(null);
  const [storeFilter, setStoreFilter] = useState(null);
  const [employeeFilter, setEmployeeFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [totalAmountRange, setTotalAmountRange] = useState([null, null]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const isSuperUser = localStorage.getItem('is_superuser') === 'true';
  const currentEmployeeId = currentUser.employee_id || currentUser.id;
  const currentStoreId = currentUser.store_id || null;
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // State cho chi tiết phiếu nhập kho
  const [receiptDetails, setReceiptDetails] = useState([]);
  const [receiptDetailModalVisible, setReceiptDetailModalVisible] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [receiptDetailForm] = Form.useForm();
  const [purchaseOrderDetails, setPurchaseOrderDetails] = useState([]);
  const [receiptDetailLoading, setReceiptDetailLoading] = useState(false);
  const [editingReceiptDetail, setEditingReceiptDetail] = useState(null);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);

  // State for the new editable workflow
  const [editableReceiptItems, setEditableReceiptItems] = useState([]);
  const [itemDetailModalVisible, setItemDetailModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemDetailForm] = Form.useForm();
  const [currentPurchaseOrderId, setCurrentPurchaseOrderId] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    fetchSuppliers();
    fetchStores();
    fetchEmployees().then(() => {
      if (!isSuperUser && currentStoreId) filterEmployeesByStore(currentStoreId);
    });
    fetchPurchaseOrders();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(SUPPLIER_ENDPOINTS.SUPPLIERS_LIST_ALL, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setSuppliers(await res.json());
    } catch {}
  };
  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(STORE_ENDPOINTS.STORES_LIST_ALL, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setStores(await res.json());
    } catch {}
  };
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(EMPLOYEE_ENDPOINTS.EMPLOYEES_LIST_ALL, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setEmployees(await res.json());
    } catch {}
  };
  const fetchPurchaseOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(PURCHASE_ENDPOINTS.PURCHASE_ORDERS, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setPurchaseOrders(data.results || []);
      }
    } catch {}
  };

  const fetchReceiptDetails = async (receiptId) => {
    try {
      setReceiptDetailLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${PURCHASE_ENDPOINTS.GOODS_RECEIPT_DETAILS}?goods_receipt=${receiptId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReceiptDetails(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      message.error('Lỗi khi tải chi tiết phiếu nhập kho');
      setReceiptDetails([]);
    } finally {
      setReceiptDetailLoading(false);
    }
  };

  const fetchReceiptInfo = async (receiptId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(PURCHASE_ENDPOINTS.GOODS_RECEIPT_DETAIL(receiptId), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Receipt info:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error fetching receipt info:', error);
      return null;
    }
  };

  const fetchPurchaseOrderDetails = async (purchaseOrderId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${PURCHASE_ENDPOINTS.PURCHASE_ORDER_DETAILS}?purchase_order=${purchaseOrderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPurchaseOrderDetails(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      message.error('Lỗi khi tải chi tiết đơn đặt hàng');
      setPurchaseOrderDetails([]);
    }
  };

  const handlePurchaseOrderChange = (purchaseOrderId) => {
    if (purchaseOrderId) {
      // Tìm thông tin đơn đặt hàng được chọn
      const selectedOrder = purchaseOrders.find(order => order.id === purchaseOrderId);
      setSelectedPurchaseOrder(selectedOrder);
      
      if (selectedOrder) {
        // Tự động điền thông tin cửa hàng và nhà cung cấp
        const store = stores.find(s => s.name === selectedOrder.store_name);
        const supplier = suppliers.find(s => s.name === selectedOrder.supplier_name);
        
        if (store) {
          form.setFieldsValue({ store: store.id });
          filterEmployeesByStore(store.id);
        }
        
        if (supplier) {
          form.setFieldsValue({ supplier: supplier.id });
        }
      }
    } else {
      setSelectedPurchaseOrder(null);
    }
  };

  const filterEmployeesByStore = (storeId) => {
    if (!storeId) {
      setFilteredEmployees([]);
      return;
    }
    const filtered = employees.filter(emp => emp.store === storeId);
    setFilteredEmployees(filtered);
  };

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      let params = new URLSearchParams();
      params.append('page', page);
      params.append('page_size', pageSize);
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (supplierFilter) params.append('supplier', supplierFilter);
      if (storeFilter) params.append('store', storeFilter);
      if (employeeFilter) params.append('employee', employeeFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (dateRange && dateRange.length === 2) {
        params.append('receipt_date_from', dateRange[0]?.format('YYYY-MM-DD'));
        params.append('receipt_date_to', dateRange[1]?.format('YYYY-MM-DD'));
      }
      if (totalAmountRange[0]) params.append('total_amount_min', totalAmountRange[0]);
      if (totalAmountRange[1]) params.append('total_amount_max', totalAmountRange[1]);
      const url = `${PURCHASE_ENDPOINTS.GOODS_RECEIPTS}?${params.toString()}`;
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Lỗi khi tải danh sách');
      const data = await res.json();
      setData(data.results || []);
      setPagination({ current: page, pageSize, total: data.count });
    } catch (err) {
      message.error(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
    // eslint-disable-next-line
  }, [debouncedSearch, supplierFilter, storeFilter, employeeFilter, statusFilter, dateRange, totalAmountRange]);

  const handleTableChange = (pag) => {
    setPagination(pag);
    fetchData(pag.current, pag.pageSize);
  };

  const handleAdd = () => {
    setEditing(null);
    setSelectedPurchaseOrder(null);
    setModalVisible(true);
  };
  const handleEdit = (record) => {
    setEditing(record);
    setModalVisible(true);
  };
  const handleDelete = (record) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa phiếu nhập hàng này?',
      icon: <ExclamationCircleOutlined />,
      content: record.receipt_number,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const res = await fetch(PURCHASE_ENDPOINTS.GOODS_RECEIPT_DETAIL(record.id), { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
          if (!res.ok) throw new Error('Xóa thất bại');
          message.success('Đã xóa phiếu nhập hàng');
          fetchData(pagination.current, pagination.pageSize);
        } catch (err) {
          message.error('Không thể xóa');
        }
      }
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (values.receipt_date) values.receipt_date = values.receipt_date.format('YYYY-MM-DD');
      if (!isSuperUser) {
        values.employee = currentEmployeeId;
        values.store = currentStoreId;
      }
      
      // Loại bỏ trường payment_status nếu có
      const { payment_status, ...cleanValues } = values;
      
      const token = localStorage.getItem('accessToken');
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? PURCHASE_ENDPOINTS.GOODS_RECEIPT_DETAIL(editing.id) : PURCHASE_ENDPOINTS.GOODS_RECEIPTS;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(cleanValues)
      });
      if (!res.ok) {
        let errorMsg = 'Có lỗi xảy ra';
        try {
          const errorData = await res.json();
          if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
              // Nếu là string dạng object Python repr, dùng regex lấy chuỗi trong ErrorDetail(string='...')
              const regex = /ErrorDetail\(string='([^']+)'/;
              const match = errorData.detail.match(regex);
              if (match && match[1]) errorMsg = match[1];
              else errorMsg = errorData.detail;
            } else {
              const extracted = extractFirstString(errorData.detail);
              if (extracted) errorMsg = extracted;
            }
          }
        } catch {}
        message.error(errorMsg);
        return;
      }
      message.success(editing ? 'Cập nhật thành công' : 'Thêm mới thành công');
      setModalVisible(false);
      fetchData(pagination.current, pagination.pageSize);
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.message);
    }
  };

  const clearFilters = () => {
    setSupplierFilter(null);
    setStoreFilter(null);
    setEmployeeFilter(null);
    setStatusFilter(null);
    setDateRange(null);
    setTotalAmountRange([null, null]);
  };

  // Thêm hàm ánh xạ trạng thái sang tiếng Việt
  const statusVN = {
    draft: 'Nháp',
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };

  // Thêm hàm lấy màu tag trạng thái
  const statusTagColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'pending': return 'orange';
      case 'confirmed': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const columns = [
    { title: 'Mã phiếu nhập', dataIndex: 'receipt_number', key: 'receipt_number', render: (text) => <b>{text}</b> },
    { title: 'Nhà cung cấp', dataIndex: 'supplier_name', key: 'supplier_name' },
    { title: 'Cửa hàng', dataIndex: 'store_name', key: 'store_name' },
    { title: 'Nhân viên', dataIndex: 'employee_name', key: 'employee_name' },
    { title: 'Đơn đặt hàng', dataIndex: 'purchase_order_number', key: 'purchase_order_number' },
    { title: 'Ngày nhập kho', dataIndex: 'receipt_date', key: 'receipt_date', render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => <Tag color={statusTagColor(status)}>{statusVN[status] || status}</Tag> },
    { title: 'Tổng tiền', dataIndex: 'total_amount', key: 'total_amount', render: (amount) => amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) : '' },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            className="action-btn"
            onClick={async () => {
              setSelectedReceiptId(record.id);
              fetchReceiptDetails(record.id);
              
              const receiptInfo = await fetchReceiptInfo(record.id);
              
              let purchaseOrderId = null;
              if (receiptInfo && receiptInfo.purchase_order) {
                purchaseOrderId = receiptInfo.purchase_order;
              }
              
              if (purchaseOrderId) {
                setCurrentPurchaseOrderId(purchaseOrderId);
                fetchPurchaseOrderDetails(purchaseOrderId);
              } else {
                setCurrentPurchaseOrderId(null);
                setPurchaseOrderDetails([]); // Clear stale data if no PO found
                message.warning('Không tìm thấy đơn đặt hàng liên quan.');
              }
              
              setReceiptDetailModalVisible(true);
            }}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            className="action-btn"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record)}
          >
            <Button danger icon={<DeleteOutlined />} className="action-btn" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const receiptDetailColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'product_variant_info',
      key: 'product_name',
      render: (info) => info?.product_name || '-',
    },
    {
      title: 'SKU',
      dataIndex: 'product_variant_info',
      key: 'sku',
      render: (info) => info?.sku || '-',
    },
    {
      title: 'Số lượng đặt',
      dataIndex: 'ordered_quantity',
      key: 'ordered_quantity',
    },
    {
      title: 'Số lượng nhập',
      dataIndex: 'received_quantity',
      key: 'received_quantity',
    },
    {
      title: 'Số lượng chấp nhận',
      dataIndex: 'accepted_quantity',
      key: 'accepted_quantity',
    },
    {
      title: 'Số lượng từ chối',
      dataIndex: 'rejected_quantity',
      key: 'rejected_quantity',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (price) => formatCurrency(price),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => formatCurrency(amount),
    },
    {
      title: 'Trạng thái chất lượng',
      dataIndex: 'quality_status',
      key: 'quality_status',
      render: (status) => {
        const statusMap = {
          'accepted': { text: 'Chấp nhận', color: 'green' },
          'rejected': { text: 'Từ chối', color: 'red' },
          'partial': { text: 'Một phần', color: 'orange' }
        };
        const statusInfo = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            className="action-btn"
            onClick={() => {
              setEditingReceiptDetail(record);
              receiptDetailForm.setFieldsValue({
                product_variant: record.product_variant_info?.id,
                purchase_order_detail: record.purchase_order_detail,
                ordered_quantity: record.ordered_quantity,
                received_quantity: record.received_quantity,
                accepted_quantity: record.accepted_quantity,
                rejected_quantity: record.rejected_quantity,
                unit_price: record.unit_price,
                discount_percent: record.discount_percent,
                tax_percent: record.tax_percent,
                quality_status: record.quality_status,
                quality_notes: record.quality_notes,
                batch_number: record.batch_number,
                notes: record.notes
              });
            }}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDeleteReceiptDetail(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} className="action-btn" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleReceiptDetailSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!selectedReceiptId) {
        message.error('Không tìm thấy ID phiếu nhập kho');
        return false;
      }
      
      const baseData = {
        product_variant: values.product_variant,
        purchase_order_detail: values.purchase_order_detail,
        ordered_quantity: values.ordered_quantity,
        received_quantity: values.received_quantity || values.ordered_quantity,
        accepted_quantity: values.accepted_quantity || values.received_quantity || values.ordered_quantity,
        rejected_quantity: values.rejected_quantity || 0,
        unit_price: values.unit_price || 0,
        discount_percent: values.discount_percent || "0.00",
        tax_percent: values.tax_percent || "0.00",
        quality_status: values.quality_status || "accepted",
        quality_notes: values.quality_notes || "",
        batch_number: values.batch_number || "",
        notes: values.notes || ""
      };

      if (editingReceiptDetail) {
        // Update
        const response = await fetch(PURCHASE_ENDPOINTS.GOODS_RECEIPT_DETAIL_ITEM(editingReceiptDetail.id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...baseData,
            id: editingReceiptDetail.id
          }),
        });
        if (response.status === 403) {
          message.error('Bạn không có quyền sửa chi tiết phiếu nhập kho.');
          return false;
        }
        message.success('Cập nhật chi tiết phiếu nhập kho thành công');
      } else {
        // Thêm mới
        const requestData = {
          ...baseData,
          goods_receipt: selectedReceiptId
        };
        
        const response = await fetch(PURCHASE_ENDPOINTS.GOODS_RECEIPT_DETAILS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          message.error(`Lỗi: ${errorData.detail || 'Không thể thêm chi tiết phiếu nhập kho'}`);
          return false;
        }
        
        if (response.status === 403) {
          message.error('Bạn không có quyền thêm chi tiết phiếu nhập kho.');
          return false;
        }
        message.success('Thêm chi tiết phiếu nhập kho thành công');
      }
      return true;
    } catch (error) {
      console.error('Error in handleReceiptDetailSubmit:', error);
      message.error('Có lỗi xảy ra khi thêm/sửa chi tiết phiếu nhập kho');
      return false;
    }
  };

  const handleDeleteReceiptDetail = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(PURCHASE_ENDPOINTS.GOODS_RECEIPT_DETAIL_ITEM(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xóa chi tiết phiếu nhập kho này.');
        return;
      }

      message.success('Xóa chi tiết phiếu nhập kho thành công');
      fetchReceiptDetails(selectedReceiptId);
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa chi tiết phiếu nhập kho');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return `${parseFloat(amount).toLocaleString('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}đ`;
  };

  useEffect(() => {
    if (!receiptDetailModalVisible) {
      setEditableReceiptItems([]); // Clear when modal is closed
      return;
    }

    const items = purchaseOrderDetails.map(poDetail => {
      const grDetail = receiptDetails.find(grd => grd.purchase_order_detail === poDetail.id);
      
      const pvi = poDetail.product_variant_info || {};
      pvi.display_name = pvi.product_name || pvi.name || pvi.sku || 'Không có tên';

      // Max receivable quantity for this GR session
      const po_remaining_at_load = poDetail.missing_quantity ?? poDetail.remaining_quantity ?? 0;
      const gr_saved_received_qty = grDetail?.received_quantity || 0;
      const max_receivable_qty = po_remaining_at_load + gr_saved_received_qty;

      // Base item from Purchase Order
      const baseItem = {
        key: poDetail.id,
        id: null,
        purchase_order_detail_id: poDetail.id,
        product_variant_info: pvi,
        product_variant: poDetail.product_variant,
        ordered_quantity: poDetail.quantity,
        max_receivable_qty: max_receivable_qty, // Store max value for input validation
        unit_price: poDetail.unit_price,
        // Default values for this GR, to be populated by grDetail if it exists
        received_quantity: 0,
        accepted_quantity: 0,
        rejected_quantity: 0,
        quality_status: 'accepted',
        quality_notes: '',
        notes: '',
        batch_number: '',
      };

      // If there are details for THIS specific goods receipt, use them as the source of truth.
      if (grDetail) {
        baseItem.id = grDetail.id;
        baseItem.received_quantity = grDetail.received_quantity || 0;
        baseItem.accepted_quantity = grDetail.accepted_quantity || 0;
        baseItem.rejected_quantity = grDetail.rejected_quantity || 0;
        baseItem.unit_price = grDetail.unit_price || baseItem.unit_price;
        baseItem.quality_status = grDetail.quality_status || 'accepted';
        baseItem.quality_notes = grDetail.quality_notes || '';
        baseItem.notes = grDetail.notes || '';
        baseItem.batch_number = grDetail.batch_number || '';
      }

      // Calculate the displayed missing quantity for the UI based on user's live formula
      baseItem.display_remaining_quantity = baseItem.ordered_quantity - baseItem.received_quantity;

      return baseItem;
    });
    setEditableReceiptItems(items);
  }, [purchaseOrderDetails, receiptDetails, receiptDetailModalVisible]);

  const handleReceiptItemChange = (key, field, value) => {
    setEditableReceiptItems(currentItems =>
      currentItems.map(item => {
        if (item.key === key) {
          const newItem = { ...item, [field]: value };
          
          // Recalculate 'display_remaining_quantity' if 'received_quantity' changes based on user formula
          if (field === 'received_quantity') {
            newItem.display_remaining_quantity = newItem.ordered_quantity - (newItem.received_quantity || 0);
          }

          // always recalculate rejected quantity if received or accepted changes
          const received = newItem.received_quantity || 0;
          const accepted = newItem.accepted_quantity || 0;
          newItem.rejected_quantity = Math.max(0, received - accepted);
          
          return newItem;
        }
        return item;
      })
    );
  };
  
  const openEditItemModal = (item) => {
    setEditingItem(item);
    itemDetailForm.setFieldsValue(item);
    setItemDetailModalVisible(true);
  };

  const handleItemDetailSave = async () => {
    try {
      const values = await itemDetailForm.validateFields();
      handleReceiptItemChange(editingItem.key, 'accepted_quantity', values.accepted_quantity);
      setItemDetailModalVisible(false);
    } catch (error) {
      console.log('Validation Failed:', error);
    }
  };

  const handleSaveAllReceiptDetails = async () => {
    if (!selectedReceiptId) {
      message.error("Lỗi: Không tìm thấy mã phiếu nhập kho. Vui lòng đóng cửa sổ và thử lại.");
      return;
    }

    setReceiptDetailLoading(true);
    const token = localStorage.getItem('accessToken');
    
    // Process all items that have data to save
    const changedItems = editableReceiptItems.filter(item => 
      item.accepted_quantity > 0 || item.received_quantity > 0 || item.id
    );

    console.log('Total editable items:', editableReceiptItems);
    console.log('Items to process:', changedItems);

    if (changedItems.length === 0) {
      message.warning('Không có dữ liệu nào để lưu. Vui lòng nhập số lượng chấp nhận hoặc số lượng nhập.');
      setReceiptDetailLoading(false);
      return;
    }

    const promises = changedItems.map(item => {
      console.log('Processing item:', item);
      
      // If item exists but has no quantities, delete it
      if (item.id && item.accepted_quantity === 0 && item.received_quantity === 0) {
        console.log('Deleting existing item:', item.id);
        return fetch(PURCHASE_ENDPOINTS.GOODS_RECEIPT_DETAIL_ITEM(item.id), {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      // Create or update item with quantities
      if (item.accepted_quantity > 0 || item.received_quantity > 0) {
        const payload = {
          goods_receipt: selectedReceiptId,
          purchase_order_detail: item.purchase_order_detail_id,
          product_variant: item.product_variant,
          ordered_quantity: item.ordered_quantity,
          received_quantity: item.received_quantity || item.accepted_quantity,
          accepted_quantity: item.accepted_quantity || item.received_quantity,
          rejected_quantity: item.rejected_quantity || 0,
          unit_price: item.unit_price || 0,
          discount_percent: "0.00",
          tax_percent: "0.00",
          quality_status: item.quality_status || "accepted",
          quality_notes: item.quality_notes || "",
          batch_number: item.batch_number || "",
          notes: item.notes || "",
        };

        console.log('Payload for item:', item.product_variant_info?.display_name, payload);

        const url = item.id
          ? PURCHASE_ENDPOINTS.GOODS_RECEIPT_DETAIL_ITEM(item.id)
          : PURCHASE_ENDPOINTS.GOODS_RECEIPT_DETAILS;
        
        const method = item.id ? 'PUT' : 'POST';

        console.log('Making request:', method, url);

        return fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload)
        }).then(async res => {
            console.log('Response status:', res.status);
            if (!res.ok) {
                const err = await res.json();
                console.log('Error response:', err);
                return Promise.reject({ ...err, item_sku: item.product_variant_info?.sku });
            }
            const result = await res.json();
            console.log('Success response:', result);
            return result;
        });
      }
      
      // Skip items with no data
      console.log('Skipping item with no data:', item);
      return Promise.resolve({ ok: true, isSkipped: true });
    });

    try {
      const results = await Promise.all(promises);
      console.log('All results:', results);
      message.success('Đã lưu chi tiết phiếu nhập kho thành công!');
      if (currentPurchaseOrderId) {
          fetchPurchaseOrderDetails(currentPurchaseOrderId);
      }
      fetchReceiptDetails(selectedReceiptId);
    } catch (error) {
      console.error('Lỗi khi lưu chi tiết phiếu nhập kho:', error);
      const sku = error.item_sku ? ` cho sản phẩm ${error.item_sku}` : '';
      const errorDetail = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail);
      message.error(`Lỗi khi lưu${sku}: ${errorDetail || 'Lỗi không xác định'}`);
    } finally {
      setReceiptDetailLoading(false);
    }
  };

  return (
    <div className="admin-users-list">
      <div className="admin-list-header">
        <h2>Quản lý phiếu nhập hàng</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm theo mã phiếu, nhà cung cấp, cửa hàng..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 320 }}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={() => fetchData(pagination.current, pagination.pageSize)} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm mới</Button>
          <Button onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          </Button>
        </div>
      </div>
      {showFilters && (
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Nhà cung cấp"
                value={supplierFilter}
                onChange={setSupplierFilter}
                allowClear
                showSearch
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                style={{ width: '100%' }}
              >
                {suppliers.map(supplier => (
                  <Select.Option key={supplier.id} value={supplier.id}>{supplier.name}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Cửa hàng"
                value={storeFilter}
                onChange={setStoreFilter}
                allowClear
                showSearch
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                style={{ width: '100%' }}
              >
                {stores.map(store => (
                  <Select.Option key={store.id} value={store.id}>{store.name}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Nhân viên"
                value={employeeFilter}
                onChange={setEmployeeFilter}
                allowClear
                showSearch
                filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                style={{ width: '100%' }}
              >
                {employees.map(employee => (
                  <Select.Option key={employee.id} value={employee.id}>{employee.name}</Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder="Trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                style={{ width: '100%' }}
              >
                <Select.Option value="draft">Nháp</Select.Option>
                <Select.Option value="pending">Chờ xác nhận</Select.Option>
                <Select.Option value="confirmed">Đã xác nhận</Select.Option>
                <Select.Option value="completed">Hoàn thành</Select.Option>
                <Select.Option value="cancelled">Đã hủy</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <RangePicker
                placeholder={['Từ ngày', 'Đến ngày']}
                value={dateRange}
                onChange={setDateRange}
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input.Group compact>
                <Input
                  placeholder="Từ"
                  value={totalAmountRange[0]}
                  onChange={e => setTotalAmountRange([e.target.value, totalAmountRange[1]])}
                  style={{ width: '50%' }}
                />
                <Input
                  placeholder="Đến"
                  value={totalAmountRange[1]}
                  onChange={e => setTotalAmountRange([totalAmountRange[0], e.target.value])}
                  style={{ width: '50%' }}
                />
              </Input.Group>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Button onClick={clearFilters} style={{ width: '100%' }}>
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Card>
      )}
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        className="admin-table"
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: true }}
      />
      <Modal
        title={editing ? 'Chỉnh sửa phiếu nhập hàng' : 'Thêm phiếu nhập hàng'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleModalOk}
        okText={editing ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
        destroyOnHidden
        width={800}
        afterOpenChange={(open) => {
          if (open && !editing) {
            form.resetFields();
            setSelectedPurchaseOrder(null);
          }
          if (open && editing) {
            // Loại bỏ trường payment_status khỏi dữ liệu editing
            const { payment_status, ...cleanEditingData } = editing;
            form.setFieldsValue({ 
              ...cleanEditingData, 
              receipt_date: editing.receipt_date ? dayjs(editing.receipt_date) : null 
            });
            
            // Tìm và set selectedPurchaseOrder nếu có purchase_order
            if (editing.purchase_order) {
              const order = purchaseOrders.find(o => o.id === editing.purchase_order);
              setSelectedPurchaseOrder(order);
            }
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ 
            status: 'draft',
            receipt_date: dayjs() // Ngày hiện tại theo múi giờ Việt Nam
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="purchase_order" label="Đơn đặt hàng" rules={[{ required: true, message: 'Chọn đơn đặt hàng' }]}>
                <Select 
                  placeholder="Chọn đơn đặt hàng" 
                  showSearch
                  onChange={handlePurchaseOrderChange}
                  filterOption={(input, option) => 
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {purchaseOrders.map(order => (
                    <Select.Option key={order.id} value={order.id}>
                      {order.po_number} - {order.supplier_name} - {order.store_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="supplier" label="Nhà cung cấp" rules={[{ required: true, message: 'Chọn nhà cung cấp' }]}>
                <Select placeholder="Chọn nhà cung cấp" showSearch disabled={!selectedPurchaseOrder}>
                  {suppliers.map(supplier => (
                    <Select.Option key={supplier.id} value={supplier.id}>{supplier.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="store" label="Cửa hàng" rules={[{ required: true, message: 'Chọn cửa hàng' }]}>
                <Select 
                  placeholder="Chọn cửa hàng" 
                  showSearch
                  disabled={!selectedPurchaseOrder || !isSuperUser}
                  onChange={(storeId) => {
                    filterEmployeesByStore(storeId);
                    if (isSuperUser) form.setFieldsValue({ employee: undefined });
                  }}
                  value={isSuperUser ? undefined : currentStoreId}
                >
                  {stores.map(store => (
                    <Select.Option key={store.id} value={store.id}>{store.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="receipt_date" label="Ngày nhập kho" rules={[{ required: true, message: 'Chọn ngày nhập kho' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          {selectedPurchaseOrder && (
            <div style={{ marginBottom: 16, padding: 12, background: '#f0f8ff', borderRadius: 6, border: '1px solid #d6e4ff' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>Thông tin đơn đặt hàng</h4>
              <Row gutter={16}>
                <Col span={8}>
                  <div><b>Mã đơn hàng:</b> {selectedPurchaseOrder.po_number}</div>
                  <div><b>Nhà cung cấp:</b> {selectedPurchaseOrder.supplier_name}</div>
                </Col>
                <Col span={8}>
                  <div><b>Cửa hàng:</b> {selectedPurchaseOrder.store_name}</div>
                  <div><b>Nhân viên:</b> {selectedPurchaseOrder.employee_name}</div>
                </Col>
                <Col span={8}>
                  <div><b>Ngày đặt:</b> {selectedPurchaseOrder.order_date ? new Date(selectedPurchaseOrder.order_date).toLocaleDateString('vi-VN') : ''}</div>
                  <div><b>Tổng tiền:</b> {selectedPurchaseOrder.total_amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedPurchaseOrder.total_amount) : ''}</div>
                </Col>
              </Row>
            </div>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái">
                <Select>
                  <Select.Option value="draft">Nháp</Select.Option>
                  <Select.Option value="pending">Chờ xác nhận</Select.Option>
                  <Select.Option value="confirmed">Đã xác nhận</Select.Option>
                  <Select.Option value="completed">Hoàn thành</Select.Option>
                  <Select.Option value="cancelled">Đã hủy</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="delivery_note" label="Số phiếu giao hàng">
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item name="vehicle_number" label="Biển số xe">
            <Input maxLength={20} />
          </Form.Item>
          <Form.Item name="driver_name" label="Tên tài xế">
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} maxLength={500} />
          </Form.Item>
          <Form.Item name="employee" label="Nhân viên" rules={[{ required: true, message: 'Chọn nhân viên' }]}> 
            <Select
              placeholder="Chọn nhân viên"
              showSearch
              allowClear
              disabled={!isSuperUser || !form.getFieldValue('store')}
              value={isSuperUser ? undefined : currentEmployeeId}
              filterOption={(input, option) => (option.children || '').toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {filteredEmployees.map(employee => (
                <Select.Option key={employee.id} value={employee.id}>
                  {employee.name || [employee.first_name, employee.last_name].filter(Boolean).join(' ') || employee.employee_code || (employee.user_details && employee.user_details.username) || ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL SECTION: REPLACE THE OLD receiptDetailModalVisible and other related modals with these two */}
      <Modal
        title="Chi tiết phiếu nhập kho"
        open={receiptDetailModalVisible}
        onCancel={() => {
          setReceiptDetailModalVisible(false);
          setPurchaseOrderDetails([]); // Clear PO details to avoid showing stale data
          setCurrentPurchaseOrderId(null);
        }}
        footer={[
            <Button key="back" onClick={() => {
              setReceiptDetailModalVisible(false);
              setPurchaseOrderDetails([]);
              setCurrentPurchaseOrderId(null);
            }}>
              Đóng
            </Button>,
            <Button key="submit" type="primary" loading={receiptDetailLoading} onClick={handleSaveAllReceiptDetails}>
              Lưu thay đổi
            </Button>,
        ]}
        width={1400}
      >
        <Table 
            columns={[
              { title: 'Sản phẩm', dataIndex: ['product_variant_info', 'display_name'], key: 'product_name' },
              { title: 'SKU', dataIndex: ['product_variant_info', 'sku'], key: 'sku' },
              { title: 'SL Đặt', dataIndex: 'ordered_quantity', key: 'ordered_quantity' },
              { 
                title: 'SL còn thiếu', 
                dataIndex: 'display_remaining_quantity', // Use the new calculated field for display
                key: 'remaining_quantity',
                render: (text) => {
                    return (
                        <span style={{ color: text >= 0 ? '#52c41a' : '#faad14', fontWeight: 'bold' }}>
                            {text}
                        </span>
                    );
                }
              },
              {
                  title: 'SL Nhập',
                  dataIndex: 'received_quantity',
                  key: 'received_quantity',
                  render: (text, record) => {
                      return (
                        <InputNumber
                            min={0}
                            max={record.max_receivable_qty}
                            value={text}
                            onChange={(value) => handleReceiptItemChange(record.key, 'received_quantity', value)}
                            style={{ width: 100 }}
                        />
                      )
                  }
              },
              {
                title: 'SL Chấp Nhận',
                dataIndex: 'accepted_quantity',
                key: 'accepted_quantity',
                render: (text, record) => (
                  <InputNumber
                    min={0}
                    max={record.received_quantity || 0}
                    value={text}
                    onChange={(value) => handleReceiptItemChange(record.key, 'accepted_quantity', value)}
                    style={{ width: 100 }}
                  />
                )
              },
              { 
                title: 'SL Từ Chối', 
                dataIndex: 'rejected_quantity', 
                key: 'rejected_quantity',
                render: (text) => (
                  <span style={{ color: text > 0 ? '#ff4d4f' : '#888', fontWeight: 'bold' }}>
                    {text}
                  </span>
                )
              },
              {
                  title: 'Thao tác',
                  key: 'action',
                  render: (text, record) => (
                      <Button onClick={() => openEditItemModal(record)}>Chi tiết</Button>
                  )
              }
            ]}
            dataSource={editableReceiptItems}
            rowKey="key"
            pagination={false}
            loading={receiptDetailLoading}
            scroll={{ x: true }}
        />
      </Modal>

      {/* Modal for editing individual receipt item details */}
      <Modal
        title="Chi tiết sản phẩm nhập"
        open={itemDetailModalVisible}
        onCancel={() => setItemDetailModalVisible(false)}
        onOk={handleItemDetailSave}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={itemDetailForm} layout="vertical">
          <Form.Item label="Sản phẩm">
            <b>{editingItem?.product_variant_info?.display_name || '-'}</b>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
                <Form.Item 
                  name="accepted_quantity" 
                  label="Số lượng chấp nhận" 
                  rules={[
                    { required: true, message: 'Không được để trống' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (value > (editingItem?.received_quantity || 0)) {
                                return Promise.reject(new Error('Không thể lớn hơn SL nhập'));
                            }
                            return Promise.resolve();
                        }
                    })
                  ]}
                >
                    <InputNumber min={0} max={editingItem?.received_quantity || 0} style={{ width: '100%' }} />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="rejected_quantity" label="Số lượng từ chối">
                    <InputNumber min={0} disabled style={{ width: '100%' }} />
                </Form.Item>
            </Col>
          </Row>
          <Form.Item name="quality_status" label="Trạng thái chất lượng">
            <Select>
              <Select.Option value="accepted">Chấp nhận</Select.Option>
              <Select.Option value="rejected">Từ chối</Select.Option>
              <Select.Option value="partial">Một phần</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="quality_notes" label="Ghi chú chất lượng">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="batch_number" label="Số lô/Batch Number">
            <Input />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú chung">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GoodsReceiptsPage; 