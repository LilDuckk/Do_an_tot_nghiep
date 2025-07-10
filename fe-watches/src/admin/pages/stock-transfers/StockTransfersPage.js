import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Space, 
  message, 
  Popconfirm, 
  Card, 
  Row, 
  Col, 
  Tag, 
  Tooltip,
  InputNumber,
  Divider,
  Typography,
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  ShoppingOutlined,
  InboxOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { INVENTORY_ENDPOINTS, STORE_ENDPOINTS, PRODUCT_ENDPOINTS } from '@/config/api';
import { useDebounceSearch } from '@/admin/hooks/useDebounce';
import '@/admin/static/AdminCommon.css';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

// Cấu hình dayjs locale
dayjs.locale('vi');

// Cấu hình DatePicker để sử dụng dayjs
DatePicker.defaultProps = {
  ...DatePicker.defaultProps,
  format: 'DD/MM/YYYY HH:mm',
  showTime: { format: 'HH:mm' },
};

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const StockTransfersPage = () => {
  // State cho danh sách chuyển kho
  const [stockTransfers, setStockTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // State cho modal
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailEditModalVisible, setDetailEditModalVisible] = useState(false);
  const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingDetailRecord, setEditingDetailRecord] = useState(null);
  const [form] = Form.useForm();
  const [detailForm] = Form.useForm();
  const [detailEditForm] = Form.useForm();

  // State cho tìm kiếm và lọc
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceStoreFilter, setSourceStoreFilter] = useState('');
  const [destinationStoreFilter, setDestinationStoreFilter] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [createdByFilter, setCreatedByFilter] = useState('');

  // State cho dữ liệu phụ trợ
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedTransferDetails, setSelectedTransferDetails] = useState([]);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [storeInventory, setStoreInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [variantsLoading, setVariantsLoading] = useState(false);

  const { debouncedSearchText, currentPage, setCurrentPage } = useDebounceSearch(searchText);

  // Các trạng thái chuyển kho
  const statusOptions = [
    { value: 'pending', label: 'Chờ xử lý', color: 'orange' },
    { value: 'in_transit', label: 'Đang chuyển', color: 'blue' },
    { value: 'completed', label: 'Hoàn thành', color: 'green' },
    { value: 'cancelled', label: 'Đã hủy', color: 'red' },
  ];

  // Fetch danh sách chuyển kho
  const fetchStockTransfers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      let url = INVENTORY_ENDPOINTS.STOCK_TRANSFERS;
      const params = new URLSearchParams();
      
      // Thêm các tham số tìm kiếm và lọc
      if (debouncedSearchText) {
        params.append('search', debouncedSearchText);
      }
      if (statusFilter) {
        params.append('status', statusFilter);
      }
      if (sourceStoreFilter) {
        params.append('source_store', sourceStoreFilter);
      }
      if (destinationStoreFilter) {
        params.append('destination_store', destinationStoreFilter);
      }
      if (createdByFilter) {
        params.append('created_by', createdByFilter);
      }
      if (dateRange && dateRange.length === 2) {
        params.append('transfer_date_from', dateRange[0].format('YYYY-MM-DD'));
        params.append('transfer_date_to', dateRange[1].format('YYYY-MM-DD'));
      }
      
      // Thêm phân trang
      params.append('page', currentPage);
      params.append('page_size', pageSize);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Lỗi khi tải danh sách chuyển kho');
      }

      const data = await response.json();
      setStockTransfers(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách chuyển kho');
      setStockTransfers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchText, statusFilter, sourceStoreFilter, destinationStoreFilter, dateRange, createdByFilter, currentPage, pageSize]);

  // Fetch danh sách cửa hàng
  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(STORE_ENDPOINTS.STORES_LIST_ALL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStores(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách cửa hàng');
    }
  };

  // Fetch danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(PRODUCT_ENDPOINTS.PRODUCTS_LIST_ALL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách sản phẩm');
    }
  };

  // Fetch danh sách variants
  const fetchVariants = async () => {
    try {
      setVariantsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(PRODUCT_ENDPOINTS.VARIANTS_LIST_ALL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setVariants(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách variants');
    } finally {
      setVariantsLoading(false);
    }
  };

  // Fetch inventory của cửa hàng
  const fetchStoreInventory = async (storeId) => {
    try {
      setInventoryLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${INVENTORY_ENDPOINTS.STORE_INVENTORY}?store_id=${storeId}&in_stock_only=true&ordering=-quantity`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Lỗi khi tải dữ liệu tồn kho');
      }
      
      const data = await response.json();
      // Chuyển đổi cấu trúc dữ liệu để phù hợp với code hiện tại
      const inventoryItems = data.inventory_items?.map(item => ({
        id: item.id,
        product_variant: item.product?.variants?.[0]?.id, // Lấy variant đầu tiên
        product_variant_info: {
          id: item.product?.variants?.[0]?.id,
          name: item.product?.name,
          sku: item.product?.variants?.[0]?.sku,
          price: item.product?.base_price,
          product_name: item.product?.name
        },
        quantity: item.quantity || 0,
        product: item.product
      })) || [];
      
      setStoreInventory(inventoryItems);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu tồn kho');
      setStoreInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  };

  // Fetch chi tiết chuyển kho
  const fetchTransferDetails = async (transferId) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Lấy thông tin chuyển kho
      const transferResponse = await fetch(`${INVENTORY_ENDPOINTS.STOCK_TRANSFER_DETAIL(transferId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!transferResponse.ok) {
        throw new Error('Lỗi khi tải thông tin chuyển kho');
      }
      
      const transferData = await transferResponse.json();
      console.log('Transfer data:', transferData);
      setSelectedTransfer(transferData);
      
      // Lấy danh sách chi tiết sản phẩm
      const detailsResponse = await fetch(`${INVENTORY_ENDPOINTS.STOCK_TRANSFER_DETAILS}?stock_transfer=${transferId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!detailsResponse.ok) {
        throw new Error('Lỗi khi tải danh sách sản phẩm');
      }
      
      const detailsData = await detailsResponse.json();
      console.log('Transfer details data:', detailsData);
      
      const details = detailsData.results || detailsData.details || [];
      setSelectedTransferDetails(Array.isArray(details) ? details : []);
    } catch (error) {
      console.error('Error fetching transfer details:', error);
      message.error('Lỗi khi tải chi tiết chuyển kho');
      setSelectedTransfer(null);
      setSelectedTransferDetails([]);
    }
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const url = editingRecord 
        ? INVENTORY_ENDPOINTS.STOCK_TRANSFER_DETAIL(editingRecord.id)
        : INVENTORY_ENDPOINTS.STOCK_TRANSFERS;
      
      const method = editingRecord ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...values,
          transfer_date: values.transfer_date?.toISOString(),
        })
      });

      if (!response.ok) {
        throw new Error('Lỗi khi lưu chuyển kho');
      }

      message.success(editingRecord ? 'Cập nhật chuyển kho thành công' : 'Tạo chuyển kho thành công');
      setModalVisible(false);
      form.resetFields();
      setEditingRecord(null);
      fetchStockTransfers();
    } catch (error) {
      message.error('Lỗi khi lưu chuyển kho');
    }
  };

  // Xử lý xóa
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(INVENTORY_ENDPOINTS.STOCK_TRANSFER_DETAIL(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Lỗi khi xóa chuyển kho');
      }

      message.success('Xóa chuyển kho thành công');
      fetchStockTransfers();
    } catch (error) {
      message.error('Lỗi khi xóa chuyển kho');
    }
  };

  // Xử lý xác nhận chuyển kho
  const handleConfirmTransfer = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(INVENTORY_ENDPOINTS.STOCK_TRANSFER_CONFIRM(id), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Lỗi khi xác nhận chuyển kho');
      }

      message.success('Xác nhận chuyển kho thành công');
      fetchStockTransfers();
    } catch (error) {
      message.error('Lỗi khi xác nhận chuyển kho');
    }
  };

  // Xử lý hủy chuyển kho
  const handleCancelTransfer = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(INVENTORY_ENDPOINTS.STOCK_TRANSFER_CANCEL(id), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Lỗi khi hủy chuyển kho');
      }

      message.success('Hủy chuyển kho thành công');
      fetchStockTransfers();
    } catch (error) {
      message.error('Lỗi khi hủy chuyển kho');
    }
  };

  // Xử lý thêm chi tiết sản phẩm
  const handleAddDetail = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(INVENTORY_ENDPOINTS.STOCK_TRANSFER_DETAILS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...values,
          stock_transfer: selectedTransfer.id,
        })
      });

      if (!response.ok) {
        throw new Error('Lỗi khi thêm sản phẩm');
      }

      message.success('Thêm sản phẩm thành công');
      setDetailEditModalVisible(false);
      detailEditForm.resetFields();
      setEditingDetailRecord(null);
      fetchTransferDetails(selectedTransfer.id);
    } catch (error) {
      message.error('Lỗi khi thêm sản phẩm');
    }
  };

  // Xử lý cập nhật chi tiết sản phẩm
  const handleUpdateDetail = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(INVENTORY_ENDPOINTS.STOCK_TRANSFER_DETAIL_ITEM(editingDetailRecord.id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        throw new Error('Lỗi khi cập nhật sản phẩm');
      }

      message.success('Cập nhật sản phẩm thành công');
      setDetailEditModalVisible(false);
      detailEditForm.resetFields();
      setEditingDetailRecord(null);
      fetchTransferDetails(selectedTransfer.id);
    } catch (error) {
      message.error('Lỗi khi cập nhật sản phẩm');
    }
  };

  // Xử lý xóa chi tiết sản phẩm
  const handleDeleteDetail = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(INVENTORY_ENDPOINTS.STOCK_TRANSFER_DETAIL_ITEM(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Lỗi khi xóa sản phẩm');
      }

      message.success('Xóa sản phẩm thành công');
      fetchTransferDetails(selectedTransfer.id);
    } catch (error) {
      message.error('Lỗi khi xóa sản phẩm');
    }
  };

  // Xử lý chỉnh sửa chi tiết
  const handleEditDetail = (record) => {
    setEditingDetailRecord(record);
    detailEditForm.setFieldsValue({
      product_variant: record.product_variant,
      quantity: record.quantity,
      received_quantity: record.received_quantity || 0,
    });
    setDetailEditModalVisible(true);
  };

  // Xử lý chọn sản phẩm từ inventory
  const handleSelectFromInventory = (inventoryItem) => {
    // Lấy variant đầu tiên của sản phẩm
    const firstVariant = inventoryItem.product?.variants?.[0];
    if (!firstVariant) {
      message.error('Sản phẩm không có variant nào');
      return;
    }

    detailEditForm.setFieldsValue({
      product_variant: firstVariant.id,
      quantity: Math.min(inventoryItem.quantity, 10), // Mặc định chuyển tối đa 10 sản phẩm
      received_quantity: 0,
    });
    setInventoryModalVisible(false);
    setDetailEditModalVisible(true);
  };

  // Xử lý chỉnh sửa
  const handleEdit = async (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      transfer_date: record.transfer_date ? dayjs(record.transfer_date) : null,
    });
    setModalVisible(true);
  };

  // Xử lý xem chi tiết
  const handleViewDetails = async (record) => {
    await fetchTransferDetails(record.id);
    await fetchVariants(); // Load tất cả variants cho form thêm sản phẩm
    await fetchStoreInventory(record.source_store); // Load inventory của cửa hàng nguồn
    setDetailModalVisible(true);
  };

  // Xử lý thay đổi trang
  const handleTableChange = (paginationInfo) => {
    setCurrentPage(paginationInfo.current);
    setPageSize(paginationInfo.pageSize);
  };

  // Xử lý reset filter
  const handleResetFilters = () => {
    setSearchText('');
    setStatusFilter('');
    setSourceStoreFilter('');
    setDestinationStoreFilter('');
    setDateRange(null);
    setCreatedByFilter('');
    setCurrentPage(1);
  };

  // Render trạng thái
  const renderStatus = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    if (!statusOption) return <Tag color="default">{status}</Tag>;
    
    return <Tag color={statusOption.color}>{statusOption.label}</Tag>;
  };

  // Render actions
  const renderActions = (record) => {
    const canEdit = record.status === 'pending';
    const canConfirm = record.status === 'pending' || record.status === 'in_transit';
    const canCancel = record.status === 'pending' || record.status === 'in_transit';

    return (
      <Space size="small">
        <Tooltip title="Xem chi tiết">
          <Button 
            type="primary" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          />
        </Tooltip>
        
        {canEdit && (
          <Tooltip title="Chỉnh sửa">
            <Button 
              type="primary" 
              size="small" 
              icon={<EditOutlined />}
              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
        )}
        
        {canConfirm && (
          <Tooltip title="Xác nhận chuyển kho">
            <Button 
              type="primary" 
              size="small" 
              icon={<CheckCircleOutlined />}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              onClick={() => handleConfirmTransfer(record.id)}
            />
          </Tooltip>
        )}
        
        {canCancel && (
          <Tooltip title="Hủy chuyển kho">
            <Button 
              type="primary" 
              size="small" 
              icon={<CloseCircleOutlined />}
              style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
              onClick={() => handleCancelTransfer(record.id)}
            />
          </Tooltip>
        )}
        
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa chuyển kho này?"
          onConfirm={() => handleDelete(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Tooltip title="Xóa">
            <Button 
              type="primary" 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        </Popconfirm>
      </Space>
    );
  };

  // Columns cho bảng chính
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Từ cửa hàng',
      dataIndex: ['source_store_info', 'name'],
      key: 'source_store',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.source_store_info?.address}
          </Text>
        </div>
      ),
    },
    {
      title: 'Đến cửa hàng',
      dataIndex: ['destination_store_info', 'name'],
      key: 'destination_store',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.destination_store_info?.address}
          </Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: renderStatus,
      filters: statusOptions.map(option => ({
        text: option.label,
        value: option.value,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Ngày chuyển',
      dataIndex: 'transfer_date',
      key: 'transfer_date',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
      sorter: (a, b) => dayjs(a.transfer_date).diff(dayjs(b.transfer_date)),
    },
    {
      title: 'Số lượng sản phẩm',
      dataIndex: 'details_count',
      key: 'details_count',
      render: (count) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Người tạo',
      dataIndex: 'created_by_username',
      key: 'created_by',
      render: (text) => text || '-',
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: renderActions,
      width: 200,
      fixed: 'right',
    },
  ];

  // Columns cho bảng chi tiết
  const detailColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: ['product_variant_info', 'product_name'],
      key: 'product',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            SKU: {record.product_variant_info?.sku}
          </Text>
          {record.product_variant_info?.attribute_values_detail && (
            <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
              {record.product_variant_info.attribute_values_detail.map(attr => 
                `${attr.attribute_type.name}: ${attr.value}`
              ).join(' • ')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Số lượng chuyển',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity) => <Tag color="blue">{quantity || 0}</Tag>,
    },
    {
      title: 'Số lượng đã nhận',
      dataIndex: 'received_quantity',
      key: 'received_quantity',
      render: (received, record) => {
        const quantity = record.quantity || 0;
        const receivedQty = received || 0;
        const isComplete = receivedQty === quantity;
        const isPartial = receivedQty > 0 && receivedQty < quantity;
        
        return (
          <Tag color={isComplete ? 'green' : isPartial ? 'orange' : 'red'}>
            {receivedQty}/{quantity}
          </Tag>
        );
      },
    },
    {
      title: 'Tỷ lệ hoàn thành',
      key: 'completion_rate',
      render: (_, record) => {
        const quantity = record.quantity || 0;
        const receivedQty = record.received_quantity || 0;
        const rate = quantity > 0 ? Math.round((receivedQty / quantity) * 100) : 0;
        
        return (
          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{rate}%</div>
            <div style={{ 
              width: '100%', 
              height: '4px', 
              backgroundColor: '#f0f0f0', 
              borderRadius: '2px',
              marginTop: '2px'
            }}>
              <div style={{
                width: `${rate}%`,
                height: '100%',
                backgroundColor: rate === 100 ? '#52c41a' : rate > 50 ? '#faad14' : '#ff4d4f',
                borderRadius: '2px',
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        );
      },
    },
    {
      title: 'Người tạo',
      dataIndex: 'created_by_username',
      key: 'created_by',
      render: (text) => text || '-',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => {
        const canEdit = selectedTransfer?.status === 'pending' || selectedTransfer?.stock_transfer_info?.status === 'pending';
        
        return (
          <Space size="small">
            {canEdit && (
              <>
                <Tooltip title="Chỉnh sửa">
                  <Button
                    type="primary"
                    size="small"
                    icon={<EditOutlined />}
                    style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                    onClick={() => handleEditDetail(record)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa sản phẩm này?"
                  onConfirm={() => handleDeleteDetail(record.id)}
                  okText="Có"
                  cancelText="Không"
                >
                  <Tooltip title="Xóa">
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                    />
                  </Tooltip>
                </Popconfirm>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  // Effects
  useEffect(() => {
    fetchStockTransfers();
  }, [fetchStockTransfers]);

  useEffect(() => {
    fetchStores();
    fetchProducts();
  }, []);

  // Tính toán thống kê
  const statistics = {
    total: stockTransfers.length,
    pending: stockTransfers.filter(item => item.status === 'pending').length,
    inTransit: stockTransfers.filter(item => item.status === 'in_transit').length,
    completed: stockTransfers.filter(item => item.status === 'completed').length,
    cancelled: stockTransfers.filter(item => item.status === 'cancelled').length,
  };

  return (
    <div className="admin-section">
      <Card>
        <Title level={2}>Quản lý chuyển kho</Title>
        
        {/* Thống kê */}
        <Row gutter={16} className="admin-statistics-section">
          <Col span={4}>
            <Card size="small" className="admin-statistics-card info">
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>{statistics.total}</Title>
                <Text type="secondary">Tổng cộng</Text>
              </div>
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small" className="admin-statistics-card warning">
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>{statistics.pending}</Title>
                <Text type="secondary">Chờ xử lý</Text>
              </div>
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small" className="admin-statistics-card info">
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>{statistics.inTransit}</Title>
                <Text type="secondary">Đang chuyển</Text>
              </div>
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small" className="admin-statistics-card success">
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>{statistics.completed}</Title>
                <Text type="secondary">Hoàn thành</Text>
              </div>
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small" className="admin-statistics-card danger">
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>{statistics.cancelled}</Title>
                <Text type="secondary">Đã hủy</Text>
              </div>
            </Card>
          </Col>
        </Row>
        
        {/* Filters */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col span={6}>
              <Input
                placeholder="Tìm kiếm theo ghi chú, cửa hàng..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />
            </Col>
            <Col span={4}>
              <Select
                placeholder="Trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                style={{ width: '100%' }}
              >
                {statusOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Cửa hàng nguồn"
                value={sourceStoreFilter}
                onChange={setSourceStoreFilter}
                allowClear
                style={{ width: '100%' }}
              >
                {stores.map(store => (
                  <Option key={store.id} value={store.id}>
                    {store.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <Select
                placeholder="Cửa hàng đích"
                value={destinationStoreFilter}
                onChange={setDestinationStoreFilter}
                allowClear
                style={{ width: '100%' }}
              >
                {stores.map(store => (
                  <Option key={store.id} value={store.id}>
                    {store.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={4}>
              <RangePicker
                placeholder={['Từ ngày', 'Đến ngày']}
                value={dateRange}
                onChange={setDateRange}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={2}>
              <Button onClick={handleResetFilters}>Reset</Button>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRecord(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Tạo chuyển kho mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={stockTransfers}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: 0, // Total will be updated by the backend
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} chuyển kho`,
            onChange: handleTableChange,
          }}
          scroll={{ x: 1200 }}
        />

        {/* Modal tạo/chỉnh sửa */}
        <Modal
          title={editingRecord ? 'Chỉnh sửa chuyển kho' : 'Tạo chuyển kho mới'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setEditingRecord(null);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              status: 'pending',
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="source_store"
                  label="Cửa hàng nguồn"
                  rules={[
                    { required: true, message: 'Vui lòng chọn cửa hàng nguồn' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const destinationStore = getFieldValue('destination_store');
                        if (value && destinationStore && value === destinationStore) {
                          return Promise.reject(new Error('Cửa hàng nguồn và đích không được giống nhau'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Select placeholder="Chọn cửa hàng nguồn">
                    {stores.map(store => (
                      <Option key={store.id} value={store.id}>
                        {store.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="destination_store"
                  label="Cửa hàng đích"
                  rules={[
                    { required: true, message: 'Vui lòng chọn cửa hàng đích' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const sourceStore = getFieldValue('source_store');
                        if (value && sourceStore && value === sourceStore) {
                          return Promise.reject(new Error('Cửa hàng nguồn và đích không được giống nhau'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Select placeholder="Chọn cửa hàng đích">
                    {stores.map(store => (
                      <Option key={store.id} value={store.id}>
                        {store.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="transfer_date"
                  label="Ngày chuyển kho"
                  rules={[{ required: true, message: 'Vui lòng chọn ngày chuyển kho' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }}
                    showTime={{ format: 'HH:mm' }}
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Chọn ngày và giờ chuyển kho"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                >
                  <Select placeholder="Chọn trạng thái">
                    {statusOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="note"
              label="Ghi chú"
            >
              <TextArea rows={3} placeholder="Nhập ghi chú..." />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingRecord ? 'Cập nhật' : 'Tạo'}
                </Button>
                <Button onClick={() => {
                  setModalVisible(false);
                  setEditingRecord(null);
                  form.resetFields();
                }}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal chi tiết */}
        <Modal
          title="Chi tiết chuyển kho"
          open={detailModalVisible}
          onCancel={() => {
            setDetailModalVisible(false);
            setSelectedTransfer(null);
            setSelectedTransferDetails([]);
          }}
          footer={null}
          width={1200}
        >
          {selectedTransfer && (
            <>
              <Card size="small" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Text strong>Từ cửa hàng:</Text>
                    <br />
                    <Text>{selectedTransfer.source_store_info?.name || selectedTransfer.stock_transfer_info?.source_store}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {selectedTransfer.source_store_info?.address}
                    </Text>
                  </Col>
                  <Col span={8}>
                    <Text strong>Đến cửa hàng:</Text>
                    <br />
                    <Text>{selectedTransfer.destination_store_info?.name || selectedTransfer.stock_transfer_info?.destination_store}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {selectedTransfer.destination_store_info?.address}
                    </Text>
                  </Col>
                  <Col span={8}>
                    <Text strong>Trạng thái:</Text>
                    <br />
                    {renderStatus(selectedTransfer.status || selectedTransfer.stock_transfer_info?.status)}
                  </Col>
                </Row>
                <Row gutter={16} style={{ marginTop: 8 }}>
                  <Col span={8}>
                    <Text strong>Ngày chuyển:</Text>
                    <br />
                    <Text>
                      {(selectedTransfer.transfer_date || selectedTransfer.stock_transfer_info?.transfer_date)
                        ? dayjs(selectedTransfer.transfer_date || selectedTransfer.stock_transfer_info?.transfer_date).format('DD/MM/YYYY HH:mm')
                        : '-'
                      }
                    </Text>
                  </Col>
                  <Col span={8}>
                    <Text strong>Tổng sản phẩm:</Text>
                    <br />
                    <Text>{selectedTransferDetails.length}</Text>
                  </Col>
                  <Col span={8}>
                    <Text strong>Người tạo:</Text>
                    <br />
                    <Text>{selectedTransfer.created_by_username || '-'}</Text>
                  </Col>
                </Row>
                {selectedTransfer.note && (
                  <Row style={{ marginTop: 8 }}>
                    <Col span={24}>
                      <Text strong>Ghi chú:</Text>
                      <br />
                      <Text>{selectedTransfer.note}</Text>
                    </Col>
                  </Row>
                )}
              </Card>
              
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>Danh sách sản phẩm</Title>
                {selectedTransfer.status === 'pending' || selectedTransfer.stock_transfer_info?.status === 'pending' ? (
                  <Space>
                    <Button
                      type="default"
                      icon={<SearchOutlined />}
                      onClick={() => setInventoryModalVisible(true)}
                    >
                      Chọn từ kho
                    </Button>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingDetailRecord(null);
                        detailEditForm.resetFields();
                        setDetailEditModalVisible(true);
                      }}
                    >
                      Thêm sản phẩm
                    </Button>
                  </Space>
                ) : null}
              </div>
              
              {selectedTransferDetails.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Text type="secondary" style={{ fontSize: '16px' }}>
                    Chưa có sản phẩm nào trong chuyển kho này
                  </Text>
                  {selectedTransfer.status === 'pending' || selectedTransfer.stock_transfer_info?.status === 'pending' ? (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingDetailRecord(null);
                        detailEditForm.resetFields();
                        setDetailEditModalVisible(true);
                      }}
                      style={{ marginTop: '16px' }}
                    >
                      Thêm sản phẩm đầu tiên
                    </Button>
                  ) : null}
                </div>
              ) : (
                <Table
                  columns={detailColumns}
                  dataSource={selectedTransferDetails}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 1000 }}
                />
              )}
            </>
          )}
        </Modal>

        {/* Modal thêm/chỉnh sửa chi tiết sản phẩm */}
        <Modal
          title={editingDetailRecord ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          open={detailEditModalVisible}
          onCancel={() => {
            setDetailEditModalVisible(false);
            setEditingDetailRecord(null);
            detailEditForm.resetFields();
          }}
          footer={null}
          width={500}
        >
          <Form
            form={detailEditForm}
            layout="vertical"
            onFinish={editingDetailRecord ? handleUpdateDetail : handleAddDetail}
            initialValues={{
              received_quantity: 0,
            }}
          >
            <Form.Item
              name="product_variant"
              label="Sản phẩm"
              rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}
            >
              <Select
                placeholder="Chọn sản phẩm"
                showSearch
                optionFilterProp="children"
                loading={variantsLoading}
                disabled={!!editingDetailRecord}
              >
                {variants.map(variant => (
                  <Select.Option key={variant.id} value={variant.id}>
                    {variant.name} - {variant.sku}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="quantity"
              label="Số lượng chuyển"
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng!' },
                { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' },
                {
                  validator: (_, value) => {
                    const selectedVariant = detailEditForm.getFieldValue('product_variant');
                    const inventoryItem = storeInventory.find(item => 
                      item.product?.variants?.[0]?.id === selectedVariant
                    );
                    if (inventoryItem && value > inventoryItem.quantity) {
                      return Promise.reject(new Error(`Số lượng không được vượt quá tồn kho (${inventoryItem.quantity})`));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                min={1}
                style={{ width: '100%' }}
                placeholder="Nhập số lượng"
                addonAfter={
                  <Tooltip title="Số lượng tối đa có thể chuyển">
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      Tối đa: {(() => {
                        const selectedVariant = detailEditForm.getFieldValue('product_variant');
                        const inventoryItem = storeInventory.find(item => 
                          item.product?.variants?.[0]?.id === selectedVariant
                        );
                        return inventoryItem ? inventoryItem.quantity : 0;
                      })()}
                    </span>
                  </Tooltip>
                }
              />
            </Form.Item>

            <Form.Item
              name="received_quantity"
              label="Số lượng đã nhận"
              rules={[
                { type: 'number', min: 0, message: 'Số lượng đã nhận không được âm' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const quantity = getFieldValue('quantity');
                    if (value && quantity && value > quantity) {
                      return Promise.reject(new Error('Số lượng đã nhận không được vượt quá số lượng chuyển'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Nhập số lượng đã nhận"
                min={0}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingDetailRecord ? 'Cập nhật' : 'Thêm'}
                </Button>
                <Button onClick={() => {
                  setDetailEditModalVisible(false);
                  setEditingDetailRecord(null);
                  detailEditForm.resetFields();
                }}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal hiển thị inventory của cửa hàng nguồn */}
        <Modal
          title={`Kho hàng - ${selectedTransfer?.source_store_info?.name}`}
          open={inventoryModalVisible}
          onCancel={() => setInventoryModalVisible(false)}
          footer={null}
          width={1000}
        >
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              Chọn sản phẩm từ kho hàng để thêm vào chuyển kho. Chỉ hiển thị sản phẩm còn hàng.
            </Text>
            {storeInventory.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic 
                      title="Tổng sản phẩm" 
                      value={storeInventory.length} 
                      prefix={<ShoppingOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="Tổng số lượng" 
                      value={storeInventory.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                      prefix={<InboxOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="Còn hàng" 
                      value={storeInventory.filter(item => (item.quantity || 0) > 0).length}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic 
                      title="Sắp hết" 
                      value={storeInventory.filter(item => (item.quantity || 0) <= 5 && (item.quantity || 0) > 0).length}
                      prefix={<ExclamationCircleOutlined />}
                      valueStyle={{ color: '#cf1322' }}
                    />
                  </Col>
                </Row>
              </div>
            )}
          </div>
          
          <Table
            columns={[
              {
                title: 'Sản phẩm',
                dataIndex: ['product_variant_info', 'name'],
                key: 'product',
                render: (text, record) => (
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{text}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      SKU: {record.product_variant_info?.sku}
                    </Text>
                    {record.product?.category_detail?.name && record.product?.category_detail?.name !== text && (
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {record.product.category_detail.name}
                      </div>
                    )}
                    {record.product?.brand_detail?.name && record.product?.brand_detail?.name !== text && (
                      <div style={{ fontSize: '11px', color: '#666' }}>
                        {record.product.brand_detail.name}
                      </div>
                    )}
                    {record.product?.variants?.[0]?.attribute_values_detail && (
                      <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
                        {record.product.variants[0].attribute_values_detail.map(attr => 
                          `${attr.attribute_type.name}: ${attr.value}`
                        ).join(' • ')}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                title: 'Số lượng trong kho',
                dataIndex: 'quantity',
                key: 'quantity',
                render: (quantity) => (
                  <Tag color={quantity > 10 ? 'green' : quantity > 5 ? 'orange' : 'red'}>
                    {quantity}
                  </Tag>
                ),
                sorter: (a, b) => a.quantity - b.quantity,
              },
              {
                title: 'Giá',
                dataIndex: ['product_variant_info', 'price'],
                key: 'price',
                render: (price) => price ? `${parseInt(price).toLocaleString('vi-VN')} VNĐ` : '-',
              },
              {
                title: 'Hành động',
                key: 'actions',
                render: (_, record) => (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleSelectFromInventory(record)}
                    disabled={record.quantity <= 0}
                  >
                    Chọn
                  </Button>
                ),
              },
            ]}
            dataSource={storeInventory}
            rowKey="id"
            loading={inventoryLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`,
            }}
            size="small"
            scroll={{ x: 700 }}
          />
        </Modal>
      </Card>
    </div>
  );
};

export default StockTransfersPage; 