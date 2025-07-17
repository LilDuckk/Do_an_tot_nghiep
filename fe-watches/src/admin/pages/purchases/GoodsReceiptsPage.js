import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Table, Input, Button, Space, Tag, message, Modal, Form, Select, DatePicker, Card, Row, Col, Popconfirm, InputNumber } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { PURCHASE_ENDPOINTS, SUPPLIER_ENDPOINTS, STORE_ENDPOINTS, EMPLOYEE_ENDPOINTS } from '@/config/api';
import '@/admin/static/AdminCommon.css';
import dayjs from 'dayjs';
import { getUserInfo, debugUserInfo } from '@/services/userInfo';
import { useDebounceSearch } from '@/admin/hooks/useDebounce';

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
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const { isSuperUser, currentEmployeeId, currentStoreId } = getUserInfo();
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  
  // Debug log để kiểm tra thông tin user
  debugUserInfo();

  // Sử dụng useDebounceSearch hook
  const { debouncedSearchText } = useDebounceSearch(searchText);

  // State cho chi tiết phiếu nhập kho
  const [receiptDetails, setReceiptDetails] = useState([]);
  const [receiptDetailModalVisible, setReceiptDetailModalVisible] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [receiptDetailForm] = Form.useForm();

  const [receiptDetailLoading, setReceiptDetailLoading] = useState(false);
  const [editingReceiptDetail, setEditingReceiptDetail] = useState(null);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);

  // State for the new editable workflow
  const [editableReceiptItems, setEditableReceiptItems] = useState([]);
  const [itemDetailModalVisible, setItemDetailModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemDetailForm] = Form.useForm();

  const previousReceiptDetailsRef = useRef([]);
  const [quickCreateModalVisible, setQuickCreateModalVisible] = useState(false);
  const [selectedQuickCreatePO, setSelectedQuickCreatePO] = useState(null);

  // State cho đơn đặt hàng chưa có phiếu nhập kho
  const [ordersWithoutReceipt, setOrdersWithoutReceipt] = useState([]);
  const [ordersWithoutReceiptLoading, setOrdersWithoutReceiptLoading] = useState(false);
  const [ordersWithoutReceiptPagination, setOrdersWithoutReceiptPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const filterEmployeesByStore = useCallback((storeId) => {
    if (!storeId) {
      setFilteredEmployees([]);
      return;
    }
    const filtered = employees.filter(emp => emp.store === storeId);
    setFilteredEmployees(filtered);
  }, [employees]);

  useEffect(() => {
    fetchSuppliers();
    fetchStores();
    fetchEmployees().then(() => {
      // Tự động lọc nhân viên theo cửa hàng của user hiện tại nếu không phải superuser
      if (!isSuperUser && currentStoreId) {
        filterEmployeesByStore(currentStoreId);
      }
    });
    fetchPurchaseOrders();
    fetchOrdersWithoutReceipt();
  }, [isSuperUser, currentStoreId]);

  // useEffect riêng để lọc nhân viên khi employees thay đổi
  useEffect(() => {
    if (!isSuperUser && currentStoreId && employees.length > 0) {
      filterEmployeesByStore(currentStoreId);
    }
  }, [employees, isSuperUser, currentStoreId, filterEmployeesByStore]);

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

  const fetchOrdersWithoutReceipt = async (page = 1, pageSize = 20) => {
    try {
      setOrdersWithoutReceiptLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('page_size', pageSize);
      
      const response = await fetch(`${PURCHASE_ENDPOINTS.PURCHASE_ORDERS_WITHOUT_RECEIPT}?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Lỗi khi tải danh sách đơn đặt hàng chưa có phiếu nhập kho');
      }
      
      const data = await response.json();
      setOrdersWithoutReceipt(data.results || []);
      setOrdersWithoutReceiptPagination({
        current: page,
        pageSize,
        total: data.count || 0
      });
    } catch (error) {
      console.error('Error fetching orders without receipt:', error);
      message.error('Lỗi khi tải danh sách đơn đặt hàng chưa có phiếu nhập kho');
      setOrdersWithoutReceipt([]);
    } finally {
      setOrdersWithoutReceiptLoading(false);
    }
  };

  const fetchReceiptDetails = async (receiptId) => {
    try {
      setReceiptDetailLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(PURCHASE_ENDPOINTS.GOODS_RECEIPT_GET_DETAILS(receiptId), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        message.error(`Lỗi khi tải chi tiết phiếu nhập: ${response.statusText}`);
        return [];
      }
      const data = await response.json();
      const receiptDetailsArray = Array.isArray(data.details) ? data.details : [];
      
      console.log('Fetched receiptDetails:', {
        receiptId: receiptId,
        count: receiptDetailsArray.length,
        details: receiptDetailsArray.map(detail => ({
          id: detail.id,
          purchase_order_detail: detail.purchase_order_detail,
          product_variant: detail.product_variant,
          goods_receipt: detail.goods_receipt
        }))
      });
      
      setReceiptDetails(receiptDetailsArray);
      return receiptDetailsArray;
    } catch (error) {
      message.error('Lỗi khi tải chi tiết phiếu nhập kho');
      setReceiptDetails([]);
      return [];
    } finally {
      setReceiptDetailLoading(false);
    }
  };





  const handlePurchaseOrderChange = (purchaseOrderId) => {
    if (purchaseOrderId) {
      // Tìm thông tin đơn đặt hàng được chọn từ danh sách mới
      const selectedOrder = ordersWithoutReceipt.find(order => order.id === purchaseOrderId);
      setSelectedPurchaseOrder(selectedOrder);
      
      if (selectedOrder) {
        // Tự động điền thông tin cửa hàng và nhà cung cấp từ cấu trúc dữ liệu mới
        if (selectedOrder.store && selectedOrder.store.id) {
          form.setFieldsValue({ store: selectedOrder.store.id });
          filterEmployeesByStore(selectedOrder.store.id);
        }
        
        if (selectedOrder.supplier && selectedOrder.supplier.id) {
          form.setFieldsValue({ supplier: selectedOrder.supplier.id });
        }
      }
    } else {
      setSelectedPurchaseOrder(null);
    }
  };

  const fetchData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      let params = new URLSearchParams();
      params.append('page', page);
      params.append('page_size', pageSize);
      if (debouncedSearchText) params.append('search', debouncedSearchText);
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
  }, [debouncedSearchText, supplierFilter, storeFilter, employeeFilter, statusFilter, dateRange, totalAmountRange]);

  const handleTableChange = (pag) => {
    setPagination(pag);
    fetchData(pag.current, pag.pageSize);
  };

  const handleAdd = () => {
    setEditing(null);
    setSelectedPurchaseOrder(null);
    form.resetFields();
    setModalVisible(true);
    // Tự động điền thông tin nhân viên nếu không phải superuser
    if (!isSuperUser) {
      setTimeout(() => {
        form.setFieldsValue({
          employee: currentEmployeeId
        });
        // Lọc nhân viên theo cửa hàng nếu có
        if (currentStoreId) {
          filterEmployeesByStore(currentStoreId);
        }
      }, 100);
    }
  };
  const handleEdit = async (record) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(PURCHASE_ENDPOINTS.GOODS_RECEIPT_DETAIL(record.id), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Không thể tải dữ liệu chi tiết của phiếu nhập.');
      }

      const detailedRecord = await res.json();
      setEditing(detailedRecord);
      setModalVisible(true);

    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
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
      
      const token = localStorage.getItem('accessToken');
      
      if (editing) {
        // Cập nhật phiếu nhập kho hiện có
        const url = PURCHASE_ENDPOINTS.GOODS_RECEIPT_DETAIL(editing.id);
        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(values)
        });

        if (!res.ok) {
          const errorData = await res.json();
          message.error(extractFirstString(errorData) || 'Cập nhật thất bại');
          return;
        }
        message.success('Cập nhật thành công');

      } else {
        // Tạo phiếu nhập kho mới từ đơn đặt hàng
        const createReceiptData = {
          purchase_order: values.purchase_order,
          employee: values.employee,
          receipt_date: values.receipt_date,
          delivery_note: values.delivery_note || '',
          vehicle_number: values.vehicle_number || '',
          driver_name: values.driver_name || '',
          notes: values.notes || '',
        };

        // Tự động điền employee ID nếu không phải superuser
        if (!isSuperUser) {
          createReceiptData.employee = currentEmployeeId;
        }

        console.log('Creating goods receipt with data:', createReceiptData);

        const res = await fetch(PURCHASE_ENDPOINTS.GOODS_RECEIPT_CREATE_FROM_PO, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(createReceiptData)
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          message.error(extractFirstString(errorData) || 'Tạo phiếu nhập thất bại');
          return;
        }
        const result = await res.json();
        message.success(result.message || 'Tạo phiếu nhập kho thành công');
      }

      setModalVisible(false);
      fetchData(pagination.current, pagination.pageSize);

    } catch (err) {
      if (err.errorFields) return;
      console.error('Lỗi khi lưu phiếu nhập:', err);
      message.error(err.message || 'Có lỗi xảy ra');
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
              setReceiptDetailLoading(true);
              setSelectedReceiptId(record.id);
              try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(PURCHASE_ENDPOINTS.GOODS_RECEIPT_GET_DETAILS(record.id), {
                  headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) {
                  throw new Error('Lỗi khi tải chi tiết phiếu nhập.');
                }
                const data = await response.json();
                
                const items = data.details.map(detail => {
                  const pvi = detail.product_variant || {};
                  const poDetail = detail.purchase_order_detail || {};
                  
                  return {
                    key: detail.id, // Use the actual detail ID as key
                    id: detail.id,
                    purchase_order_detail_id: poDetail.id,
                    product_variant_info: {
                      ...pvi,
                      display_name: pvi.product_name || pvi.name || pvi.sku || 'Không có tên'
                    },
                    product_variant: pvi.id,
                    ordered_quantity: detail.ordered_quantity,
                    unit_price: detail.unit_price,
                    received_quantity: detail.received_quantity,
                    accepted_quantity: detail.accepted_quantity,
                    rejected_quantity: detail.rejected_quantity,
                    quality_status: detail.quality_status || 'accepted',
                    quality_notes: detail.quality_notes || '',
                    notes: detail.notes || '',
                    batch_number: detail.batch_number || '',
                    display_remaining_quantity: detail.missing_quantity, // Use from API
                  };
                });
                
                setEditableReceiptItems(items);
                setReceiptDetailModalVisible(true);

              } catch (error) {
                console.error("Lỗi khi mở chi tiết phiếu nhập:", error);
                message.error(error.message || "Đã xảy ra lỗi khi chuẩn bị dữ liệu chi tiết phiếu nhập.");
              } finally {
                setReceiptDetailLoading(false);
              }
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

  // useEffect để xử lý modal visibility
  useEffect(() => {
    if (!receiptDetailModalVisible) {
      setEditableReceiptItems([]); // Clear when modal is closed
      previousReceiptDetailsRef.current = []; // Reset previous receipt details
      return;
    }
  }, [receiptDetailModalVisible]);

  // useEffect để cập nhật dữ liệu khi receiptDetails thay đổi (khi backend tự động tạo chi tiết)
  useEffect(() => {
    if (receiptDetailModalVisible && editableReceiptItems.length > 0) {
      // Kiểm tra xem receiptDetails có thay đổi thực sự không
      const currentReceiptDetailsString = JSON.stringify(receiptDetails);
      const previousReceiptDetailsString = JSON.stringify(previousReceiptDetailsRef.current);
      
      if (currentReceiptDetailsString !== previousReceiptDetailsString) {
        console.log('ReceiptDetails changed, updating editableReceiptItems');
        console.log('Current receiptDetails:', receiptDetails);
        
        // Cập nhật các item hiện có với dữ liệu mới từ receiptDetails
        setEditableReceiptItems(currentItems =>
          currentItems.map(item => {
            // Tìm chi tiết phiếu nhập theo purchase_order_detail_id trước
            let grDetail = receiptDetails.find(grd => grd.purchase_order_detail === item.purchase_order_detail_id);
            
            // Nếu không tìm thấy, tìm theo product_variant và goods_receipt
            if (!grDetail && item.product_variant) {
              grDetail = receiptDetails.find(grd => 
                grd.product_variant === item.product_variant && 
                grd.goods_receipt === selectedReceiptId
              );
            }
            
            // Nếu vẫn không tìm thấy, tìm theo product_variant (fallback)
            if (!grDetail && item.product_variant) {
              grDetail = receiptDetails.find(grd => grd.product_variant === item.product_variant);
            }
            
            if (grDetail) {
              console.log('Found grDetail for item:', {
                product: item.product_variant_info?.display_name,
                grDetail_id: grDetail.id,
                purchase_order_detail: grDetail.purchase_order_detail,
                product_variant: grDetail.product_variant,
                goods_receipt: grDetail.goods_receipt
              });
              
              return {
                ...item,
                id: grDetail.id, // Đảm bảo luôn cập nhật id
                received_quantity: grDetail.received_quantity || item.received_quantity,
                accepted_quantity: grDetail.accepted_quantity || item.accepted_quantity,
                // Lấy rejected_quantity từ API, không tính toán lại
                rejected_quantity: grDetail.rejected_quantity || item.rejected_quantity,
                unit_price: grDetail.unit_price || item.unit_price,
                quality_status: grDetail.quality_status || item.quality_status,
                quality_notes: grDetail.quality_notes || item.quality_notes,
                notes: grDetail.notes || item.notes,
                batch_number: grDetail.batch_number || item.batch_number,
                display_remaining_quantity: item.ordered_quantity - (grDetail.received_quantity || item.received_quantity)
              };
            } else {
              console.log('No grDetail found for item:', {
                product: item.product_variant_info?.display_name,
                purchase_order_detail_id: item.purchase_order_detail_id,
                product_variant: item.product_variant,
                selectedReceiptId: selectedReceiptId
              });
            }
            return item;
          })
        );
        
        // Cập nhật reference
        previousReceiptDetailsRef.current = [...receiptDetails];
        
        // Kiểm tra lại sau khi cập nhật
        setTimeout(() => {
          const updatedItems = editableReceiptItems;
          const itemsWithoutId = updatedItems.filter(item => !item.id);
          if (itemsWithoutId.length > 0) {
            console.warn('Some items still do not have ID after update:', itemsWithoutId);
          } else {
            console.log('All items have ID after update');
          }
        }, 100);
      }
    }
  }, [receiptDetails, receiptDetailModalVisible, editableReceiptItems, selectedReceiptId]);

  const handleReceiptItemChange = (key, field, value) => {
    setEditableReceiptItems(currentItems =>
      currentItems.map(item => {
        if (item.key === key) {
          const newItem = { ...item, [field]: value };
          
          // Chỉ tính toán khi người dùng nhập số vào input
          if (field === 'received_quantity') {
            // Validation: SL đặt >= SL nhập
            if (value > newItem.ordered_quantity) {
              message.warning(`Số lượng nhập không thể lớn hơn số lượng đặt (${newItem.ordered_quantity})`);
              // Vẫn cập nhật giá trị nhưng hiển thị warning
            }
            
            // Tính toán SL còn thiếu = SL đặt - SL nhập
            newItem.display_remaining_quantity = newItem.ordered_quantity - (value || 0);
            
            // Tính toán lại SL từ chối = SL nhập - SL chấp nhận
            const accepted = newItem.accepted_quantity || 0;
            newItem.rejected_quantity = Math.max(0, (value || 0) - accepted);
          }
          
          if (field === 'accepted_quantity') {
            // Validation: SL chấp nhận <= SL nhập
            if (value > (newItem.received_quantity || 0)) {
              message.warning(`Số lượng chấp nhận không thể lớn hơn số lượng nhập (${newItem.received_quantity || 0})`);
              // Vẫn cập nhật giá trị nhưng hiển thị warning
            }
            
            // Tính toán SL từ chối = SL nhập - SL chấp nhận
            const received = newItem.received_quantity || 0;
            newItem.rejected_quantity = Math.max(0, received - (value || 0));
          }
          
          // Đảm bảo item có id nếu đã có receiptDetails
          if (!newItem.id && newItem.purchase_order_detail_id) {
            const grDetail = receiptDetails.find(grd => grd.purchase_order_detail === newItem.purchase_order_detail_id);
            if (grDetail) {
              newItem.id = grDetail.id;
            }
          }
          
          return newItem;
        }
        return item;
      })
    );
  };
  
  const openEditItemModal = (item) => {
    setEditingItem(item);
    // Lấy dữ liệu từ API, không tính toán lại
    itemDetailForm.setFieldsValue(item);
    setItemDetailModalVisible(true);
  };

  const handleItemDetailSave = async () => {
    try {
      const values = await itemDetailForm.validateFields();
      
      // Cập nhật tất cả các trường từ form
      handleReceiptItemChange(editingItem.key, 'accepted_quantity', values.accepted_quantity);
      handleReceiptItemChange(editingItem.key, 'quality_status', values.quality_status);
      handleReceiptItemChange(editingItem.key, 'quality_notes', values.quality_notes);
      handleReceiptItemChange(editingItem.key, 'batch_number', values.batch_number);
      handleReceiptItemChange(editingItem.key, 'notes', values.notes);
      
      // Cập nhật rejected_quantity trong form để hiển thị giá trị được tính toán
      const currentItem = editableReceiptItems.find(item => item.key === editingItem.key);
      const currentReceivedQuantity = currentItem ? currentItem.received_quantity : editingItem.received_quantity;
      const newRejectedQuantity = Math.max(0, (currentReceivedQuantity || 0) - (values.accepted_quantity || 0));
      itemDetailForm.setFieldsValue({ rejected_quantity: newRejectedQuantity });
      
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

    const changedItems = editableReceiptItems.map(item => ({
      detail_id: item.id,
      received_quantity: item.received_quantity,
      accepted_quantity: item.accepted_quantity,
      rejected_quantity: item.rejected_quantity,
      quality_notes: item.quality_notes || '',
      batch_number: item.batch_number || '',
      notes: item.notes || ''
    }));

    if (changedItems.length === 0) {
      message.warning('Không có thay đổi nào để lưu.');
      setReceiptDetailLoading(false);
      return;
    }

    try {
      const response = await fetch(PURCHASE_ENDPOINTS.GOODS_RECEIPT_UPDATE_QUANTITIES(selectedReceiptId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ received_quantities: changedItems })
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = extractFirstString(errorData) || 'Lỗi khi cập nhật số lượng.';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      message.success(result.message || 'Đã lưu chi tiết phiếu nhập kho thành công!');

      // Tải lại dữ liệu chi tiết để cập nhật UI
      const freshDataRes = await fetch(PURCHASE_ENDPOINTS.GOODS_RECEIPT_GET_DETAILS(selectedReceiptId), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (freshDataRes.ok) {
        const freshData = await freshDataRes.json();
        const items = freshData.details.map(detail => {
            const pvi = detail.product_variant || {};
            const poDetail = detail.purchase_order_detail || {};
            return {
              key: detail.id,
              id: detail.id,
              purchase_order_detail_id: poDetail.id,
              product_variant_info: { ...pvi, display_name: pvi.product_name || pvi.name || pvi.sku || 'Không có tên' },
              product_variant: pvi.id,
              ordered_quantity: detail.ordered_quantity,
              unit_price: detail.unit_price,
              received_quantity: detail.received_quantity,
              accepted_quantity: detail.accepted_quantity,
              rejected_quantity: detail.rejected_quantity,
              quality_status: detail.quality_status || 'accepted',
              quality_notes: detail.quality_notes || '',
              notes: detail.notes || '',
              batch_number: detail.batch_number || '',
              display_remaining_quantity: detail.missing_quantity,
            };
        });
        setEditableReceiptItems(items);
      }
    } catch (error) {
      console.error('Lỗi khi lưu chi tiết phiếu nhập kho:', error);
      message.error(error.message || 'Có lỗi xảy ra khi lưu.');
    } finally {
      setReceiptDetailLoading(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!selectedReceiptId) {
      message.error("Lỗi: Không tìm thấy mã phiếu nhập kho.");
      return;
    }

    try {
      setReceiptDetailLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(PURCHASE_ENDPOINTS.GOODS_RECEIPT_CONFIRM(selectedReceiptId), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = extractFirstString(errorData) || 'Lỗi khi xác nhận phiếu nhập kho';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      message.success(result.message || 'Đã xác nhận phiếu nhập kho thành công!');
      
      setReceiptDetailModalVisible(false);
      fetchData(pagination.current, pagination.pageSize);
      
    } catch (error) {
      console.error('Lỗi khi xác nhận phiếu nhập kho:', error);
      message.error(error.message);
    } finally {
      setReceiptDetailLoading(false);
    }
  };

  const handleCreateReceiptFromPO = async (purchaseOrderId) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const createReceiptData = {
        purchase_order: purchaseOrderId,
        employee: currentEmployeeId,
        receipt_date: dayjs().format('YYYY-MM-DD'),
        delivery_note: '',
        vehicle_number: '',
        driver_name: '',
        notes: `Tự động tạo từ đơn hàng`,
      };
      
      const response = await fetch(PURCHASE_ENDPOINTS.GOODS_RECEIPT_CREATE_FROM_PO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(createReceiptData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = extractFirstString(errorData) || 'Có lỗi xảy ra';
        message.error(errorMessage);
        return false;
      }
      
      const result = await response.json();
      message.success(result.message || 'Tạo phiếu nhập kho thành công!');
      
      fetchData(pagination.current, pagination.pageSize);
      return true;
      
    } catch (error) {
      console.error('Lỗi khi tạo phiếu nhập kho:', error);
      message.error('Có lỗi xảy ra khi tạo phiếu nhập kho');
      return false;
    }
  };

  // Hàm tạo phiếu nhập nhanh từ đơn đặt hàng
  const handleQuickCreateReceipt = () => {
    setQuickCreateModalVisible(true);
  };

  const handleQuickCreateConfirm = async () => {
    if (!selectedQuickCreatePO) {
      message.warning('Vui lòng chọn đơn đặt hàng');
      return;
    }
    
    await handleCreateReceiptFromPO(selectedQuickCreatePO);
    setQuickCreateModalVisible(false);
    setSelectedQuickCreatePO(null);
  };

  // Lấy danh sách đơn đặt hàng chưa có phiếu nhập kho
  const getAvailablePurchaseOrders = () => {
    // Sử dụng dữ liệu từ API mới thay vì tính toán từ client
    return ordersWithoutReceipt;
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
          <Button 
            type="default" 
            icon={<ShoppingCartOutlined />} 
            onClick={handleQuickCreateReceipt}
            title="Tạo phiếu nhập nhanh từ đơn đặt hàng"
            disabled={ordersWithoutReceipt.length === 0}
          >
            Tạo nhanh ({ordersWithoutReceipt.length})
          </Button>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              className="filter-toggle-btn"
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: showFilters ? '#52c41a' : '#1890ff',
                borderColor: showFilters ? '#52c41a' : '#1890ff',
                minWidth: 140
              }}
            >
              {showFilters ? 'Ẩn bộ lọc' : 'Hiển thị bộ lọc'}
            </Button>
          </div>
        </div>
      </div>
      {/* Card bộ lọc chỉ hiện khi showFilters */}
      {showFilters && (
        <Card
          className="filter-card"
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SearchOutlined />
              <span>Tìm kiếm và bộ lọc phiếu nhập kho</span>
            </div>
          }
          style={{ marginBottom: 16 }}
        >
          <div className={`filter-container filter-show`}>
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
              <Col xs={24}>
                <Space>
                  <Button
                    className="filter-clear-btn"
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={clearFilters}
                  >
                    Xóa bộ lọc
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>
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
          if (open && editing) {
            // Khi chỉnh sửa, 'editing' đã chứa dữ liệu chi tiết từ API
            form.setFieldsValue({
              ...editing,
              receipt_date: editing.receipt_date ? dayjs(editing.receipt_date) : null
            });
            // Lọc nhân viên theo cửa hàng của phiếu nhập
            if (editing.store) {
              filterEmployeesByStore(editing.store);
            }
            // Hiển thị thông tin PO nếu có - sử dụng purchase_order_info từ dữ liệu mới
            if (editing.purchase_order_info) {
              setSelectedPurchaseOrder(editing.purchase_order_info);
            } else if (editing.purchase_order) {
              // Fallback cho dữ liệu cũ
              const order = purchaseOrders.find(o => o.id === editing.purchase_order);
              setSelectedPurchaseOrder(order);
            }
          } else if (open && !editing) {
            // Khi thêm mới
            form.resetFields();
            setSelectedPurchaseOrder(null);
              // Tự động điền thông tin nhân viên nếu không phải superuser
              if (!isSuperUser) {
                setTimeout(() => {
                  form.setFieldsValue({
                    employee: currentEmployeeId
                  });
                  if (currentStoreId) {
                    filterEmployeesByStore(currentStoreId);
                  }
                }, 100);
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
                  loading={ordersWithoutReceiptLoading}
                >
                  {ordersWithoutReceipt.map(order => (
                    <Select.Option key={order.id} value={order.id}>
                      {order.po_number} - {order.supplier?.name || 'N/A'} - {order.store?.name || 'N/A'}
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
                  <div><b>Nhà cung cấp:</b> {selectedPurchaseOrder.supplier?.name || selectedPurchaseOrder.supplier_name || 'Chưa có'}</div>
                </Col>
                <Col span={8}>
                  <div><b>Cửa hàng:</b> {selectedPurchaseOrder.store?.name || selectedPurchaseOrder.store_name || 'Chưa có'}</div>
                  <div><b>Nhân viên:</b> {selectedPurchaseOrder.employee?.name || selectedPurchaseOrder.employee_name || 'Chưa có'}</div>
                </Col>
                <Col span={8}>
                  <div><b>Ngày đặt:</b> {selectedPurchaseOrder.order_date ? new Date(selectedPurchaseOrder.order_date).toLocaleDateString('vi-VN') : ''}</div>
                  <div><b>Tổng tiền:</b> {selectedPurchaseOrder.total_amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedPurchaseOrder.total_amount) : ''}</div>
                </Col>
              </Row>
            </div>
          )}
          {/* Hiển thị thông tin chi tiết khi chỉnh sửa phiếu nhập */}
          {editing && (
            <div style={{ marginBottom: 16, padding: 12, background: '#f6ffed', borderRadius: 6, border: '1px solid #b7eb8f' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#52c41a' }}>Thông tin chi tiết phiếu nhập</h4>
              <Row gutter={16}>
                <Col span={12}>
                  <div><b>Mã phiếu nhập:</b> {editing.receipt_number}</div>
                  <div><b>Trạng thái:</b> <Tag color={statusTagColor(editing.status)}>{statusVN[editing.status] || editing.status}</Tag></div>
                  {editing.purchase_order_info && (
                    <>
                      <div><b>Mã đơn hàng:</b> {editing.purchase_order_info.po_number}</div>
                      <div><b>Ngày đặt hàng:</b> {editing.purchase_order_info.order_date ? new Date(editing.purchase_order_info.order_date).toLocaleDateString('vi-VN') : ''}</div>
                      <div><b>Ngày giao dự kiến:</b> {editing.purchase_order_info.expected_delivery_date ? new Date(editing.purchase_order_info.expected_delivery_date).toLocaleDateString('vi-VN') : ''}</div>
                      <div><b>Trạng thái đơn hàng:</b> <Tag color={editing.purchase_order_info.status === 'partially_received' ? 'cyan' : 'green'}>{editing.purchase_order_info.status === 'partially_received' ? 'Nhận một phần' : editing.purchase_order_info.status}</Tag></div>
                    </>
                  )}
                </Col>
                <Col span={12}>
                  {editing.supplier_info && (
                    <>
                      <div><b>Nhà cung cấp:</b> {editing.supplier_info.name}</div>
                      <div><b>Email:</b> {editing.supplier_info.email || 'Chưa có'}</div>
                      <div><b>Điện thoại:</b> {editing.supplier_info.phone || 'Chưa có'}</div>
                      <div><b>Địa chỉ:</b> {editing.supplier_info.address || 'Chưa có'}</div>
                    </>
                  )}
                  {editing.store_info && (
                    <>
                      <div><b>Cửa hàng:</b> {editing.store_info.name}</div>
                      <div><b>Địa chỉ:</b> {editing.store_info.address}</div>
                      <div><b>Điện thoại:</b> {editing.store_info.phone}</div>
                      <div><b>Mã cửa hàng:</b> {editing.store_info.store_code}</div>
                    </>
                  )}
                  {editing.employee_info && (
                    <>
                      <div><b>Nhân viên:</b> {editing.employee_info.name}</div>
                      <div><b>Mã nhân viên:</b> {editing.employee_info.employee_code}</div>
                      <div><b>Vị trí:</b> {editing.employee_info.position}</div>
                      <div><b>Email:</b> {editing.employee_info.email}</div>
                      <div><b>Điện thoại:</b> {editing.employee_info.phone}</div>
                    </>
                  )}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={24}>
                  <div><b>Tổng tiền phiếu nhập:</b> {editing.total_amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(editing.total_amount) : ''}</div>
                  <div><b>Ngày tạo:</b> {editing.created_at ? new Date(editing.created_at).toLocaleString('vi-VN') : ''}</div>
                  <div><b>Ngày cập nhật:</b> {editing.updated_at ? new Date(editing.updated_at).toLocaleString('vi-VN') : ''}</div>
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
        }}
        footer={[
            <Button key="back" onClick={() => {
              setReceiptDetailModalVisible(false);
            }}>
              Đóng
            </Button>,
            <Button key="submit" type="primary" loading={receiptDetailLoading} onClick={handleSaveAllReceiptDetails}>
              Lưu thay đổi
            </Button>,
            <Button 
              key="confirm" 
              type="primary" 
              danger
              loading={receiptDetailLoading} 
              onClick={handleConfirmReceipt}
              style={{ marginLeft: 8 }}
            >
              Xác nhận phiếu hàng
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
                            max={record.ordered_quantity}
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
                            const currentItem = editableReceiptItems.find(item => item.key === editingItem?.key);
                            const currentReceivedQuantity = currentItem ? currentItem.received_quantity : editingItem?.received_quantity;
                            if (value > (currentReceivedQuantity || 0)) {
                                return Promise.reject(new Error('Không thể lớn hơn SL nhập'));
                            }
                            return Promise.resolve();
                        }
                    })
                  ]}
                >
                    <InputNumber 
                      min={0} 
                      max={(() => {
                        const currentItem = editableReceiptItems.find(item => item.key === editingItem?.key);
                        return currentItem ? currentItem.received_quantity : editingItem?.received_quantity;
                      })() || 0} 
                      style={{ width: '100%' }} 
                    />
                </Form.Item>
            </Col>
            <Col span={12}>
                <Form.Item name="rejected_quantity" label="Số lượng từ chối">
                    <InputNumber 
                      min={0} 
                      disabled 
                      style={{ width: '100%' }}
                      value={(() => {
                        const currentItem = editableReceiptItems.find(item => item.key === editingItem?.key);
                        const currentReceivedQuantity = currentItem ? currentItem.received_quantity : editingItem?.received_quantity;
                        const currentAcceptedQuantity = currentItem ? currentItem.accepted_quantity : editingItem?.accepted_quantity;
                        return Math.max(0, (currentReceivedQuantity || 0) - (currentAcceptedQuantity || 0));
                      })()}
                    />
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

      {/* Modal tạo phiếu nhập nhanh */}
      <Modal
        title="Tạo phiếu nhập kho nhanh"
        open={quickCreateModalVisible}
        onCancel={() => {
          setQuickCreateModalVisible(false);
          setSelectedQuickCreatePO(null);
        }}
        onOk={handleQuickCreateConfirm}
        okText="Tạo phiếu nhập"
        cancelText="Hủy"
        okButtonProps={{ disabled: !selectedQuickCreatePO }}
        width={800}
      >
        <div>
          <p style={{ marginBottom: 16 }}>Chọn đơn đặt hàng để tạo phiếu nhập kho:</p>
          {getAvailablePurchaseOrders().length > 0 ? (
            <>
              <Select
                placeholder="Chọn đơn đặt hàng"
                style={{ width: '100%' }}
                value={selectedQuickCreatePO}
                onChange={setSelectedQuickCreatePO}
                showSearch
                filterOption={(input, option) => 
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {getAvailablePurchaseOrders().map(order => (
                  <Select.Option key={order.id} value={order.id}>
                    {order.po_number} - {order.supplier?.name || 'N/A'} - {order.store?.name || 'N/A'}
                  </Select.Option>
                ))}
              </Select>
              {selectedQuickCreatePO && (
                <div style={{ marginTop: 16, padding: 12, background: '#f6ffed', borderRadius: 6, border: '1px solid #b7eb8f' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#52c41a' }}>Thông tin đơn đặt hàng</h4>
                  {(() => {
                    const selectedOrder = ordersWithoutReceipt.find(order => order.id === selectedQuickCreatePO);
                    return selectedOrder ? (
                      <Row gutter={16}>
                        <Col span={12}>
                          <div><b>Mã đơn hàng:</b> {selectedOrder.po_number}</div>
                          <div><b>Nhà cung cấp:</b> {selectedOrder.supplier?.name || 'Chưa có'}</div>
                        </Col>
                        <Col span={12}>
                          <div><b>Cửa hàng:</b> {selectedOrder.store?.name || 'Chưa có'}</div>
                          <div><b>Trạng thái:</b> <Tag color={selectedOrder.status === 'confirmed' ? 'green' : 'orange'}>{selectedOrder.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}</Tag></div>
                        </Col>
                      </Row>
                    ) : null;
                  })()}
                </div>
              )}
              
              {/* Bảng hiển thị danh sách đơn đặt hàng chưa có phiếu nhập */}
              <div style={{ marginTop: 16 }}>
                <h4>Danh sách đơn đặt hàng chưa có phiếu nhập kho</h4>
                <Table
                  dataSource={ordersWithoutReceipt}
                  loading={ordersWithoutReceiptLoading}
                  rowKey="id"
                  pagination={{
                    current: ordersWithoutReceiptPagination.current,
                    pageSize: ordersWithoutReceiptPagination.pageSize,
                    total: ordersWithoutReceiptPagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} của ${total} đơn hàng`,
                    pageSizeOptions: ['10', '20', '50'],
                    onChange: (page, pageSize) => {
                      fetchOrdersWithoutReceipt(page, pageSize);
                    }
                  }}
                  columns={[
                    {
                      title: 'Mã đơn hàng',
                      dataIndex: 'po_number',
                      key: 'po_number',
                      render: (text) => <b>{text}</b>
                    },
                    {
                      title: 'Nhà cung cấp',
                      dataIndex: ['supplier', 'name'],
                      key: 'supplier_name'
                    },
                    {
                      title: 'Cửa hàng',
                      dataIndex: ['store', 'name'],
                      key: 'store_name'
                    },
                    {
                      title: 'Trạng thái',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status) => {
                        const statusMap = {
                          'pending': { text: 'Chờ xử lý', color: 'orange' },
                          'ordered': { text: 'Đã đặt hàng', color: 'blue' },
                          'confirmed': { text: 'Đã xác nhận', color: 'green' },
                          'partially_received': { text: 'Nhận một phần', color: 'cyan' },
                          'cancelled': { text: 'Đã hủy', color: 'red' }
                        };
                        const statusInfo = statusMap[status] || { text: status, color: 'default' };
                        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
                      }
                    },
                    {
                      title: 'Tổng tiền',
                      dataIndex: 'total_amount',
                      key: 'total_amount',
                      render: (amount) => amount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) : '-'
                    },
                    {
                      title: 'Ngày đặt',
                      dataIndex: 'order_date',
                      key: 'order_date',
                      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
                    },
                    {
                      title: 'Thao tác',
                      key: 'action',
                      render: (_, record) => (
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => {
                            setSelectedQuickCreatePO(record.id);
                          }}
                          disabled={selectedQuickCreatePO === record.id}
                        >
                          {selectedQuickCreatePO === record.id ? 'Đã chọn' : 'Chọn'}
                        </Button>
                      )
                    }
                  ]}
                  size="small"
                  scroll={{ x: 800 }}
                />
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              <p>Không có đơn đặt hàng nào khả dụng để tạo phiếu nhập kho.</p>
              <p>Tất cả đơn đặt hàng đã có phiếu nhập hoặc không ở trạng thái phù hợp.</p>
              <Button 
                type="primary" 
                onClick={() => fetchOrdersWithoutReceipt(1, 10)}
                loading={ordersWithoutReceiptLoading}
              >
                Làm mới danh sách
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default GoodsReceiptsPage; 