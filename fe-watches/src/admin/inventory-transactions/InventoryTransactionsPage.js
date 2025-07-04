import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Modal,
  Row,
  Col,
  Card,
  Statistic,
  Divider,
  message
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { useDebounce } from '../hooks/useDebounce';
import '../static/AdminCommon.css';
import '../static/AdminLayout.css';
import { INVENTORY_ENDPOINTS } from '../../config/api';

const InventoryTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [referenceType, setReferenceType] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState(null);

  // Debounced search
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      // Build params như variant
      const paramsObj = {
        page: currentPage,
        page_size: pageSize,
      };
      if (debouncedSearch && debouncedSearch.trim()) paramsObj.search = debouncedSearch.trim();
      if (transactionType && transactionType.trim()) paramsObj.transaction_type = transactionType.toUpperCase();
      if (referenceType && referenceType.trim()) paramsObj.reference_type = referenceType;
      if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
        paramsObj.transaction_date_from = dateRange[0].format('YYYY-MM-DD');
        paramsObj.transaction_date_to = dateRange[1].format('YYYY-MM-DD');
      }
      const params = new URLSearchParams(paramsObj);
      const finalUrl = `${INVENTORY_ENDPOINTS.INVENTORY_TRANSACTIONS}?${params}`;
      console.log('API URL:', finalUrl);
      console.log('Params:', Object.fromEntries(params.entries()));
      console.log('Current state:', { currentPage, pageSize, debouncedSearch, transactionType, referenceType, dateRange });
      
      // Kiểm tra xem có tham số không mong muốn không
      const paramsObjFromUrl = Object.fromEntries(params.entries());
      const unexpectedParams = Object.keys(paramsObjFromUrl).filter(key => 
        !['search', 'transaction_type', 'reference_type', 'transaction_date_from', 'transaction_date_to', 'page', 'page_size'].includes(key)
      );
      if (unexpectedParams.length > 0) {
        console.warn('Unexpected params found:', unexpectedParams);
      }

      const response = await fetch(finalUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu giao dịch kho');
      }

      const data = await response.json();
      setTransactions(data.results || []);
      setTotal(data.count || 0);
      const count = data.count || 0;
      setTotalPages(Math.max(1, Math.ceil(count / pageSize)));
      if (count === 0 && currentPage !== 1) setCurrentPage(1);
      setSummary(data.summary || null);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      message.error('Lỗi khi tải dữ liệu giao dịch kho');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, transactionType, referenceType, dateRange, currentPage, pageSize]);

  // Fetch transaction summary
  const fetchTransactionSummary = async (transactionId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(INVENTORY_ENDPOINTS.INVENTORY_TRANSACTION_SUMMARY(transactionId), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await response.json();
    } catch (error) {
      console.error('Error fetching transaction summary:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle table change
  const handleTableChange = (paginationInfo) => {
    if (paginationInfo.pageSize !== pageSize) {
      setPageSize(paginationInfo.pageSize);
      setCurrentPage(1);
    } else {
      setCurrentPage(paginationInfo.current);
    }
  };

  // Handle search - removed unused function

  // Handle filter change
  const handleFilterChange = (key, value) => {
    if (key === 'transaction_type') {
      setTransactionType(value);
    } else if (key === 'reference_type') {
      setReferenceType(value);
    } else if (key === 'date_range') {
      setDateRange(value);
    }
    setCurrentPage(1);
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi search
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setTransactionType('');
    setReferenceType('');
    setDateRange(null);
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Handle view details
  const handleViewDetails = (record) => {
    setSelectedTransaction(record);
    setDetailModalVisible(true);
  };

  // Handle view summary
  const handleViewSummary = async (record) => {
    await fetchTransactionSummary(record.id);
    setSummaryModalVisible(true);
  };

  // Get transaction type color
  const getTransactionTypeColor = (type) => {
    switch ((type || '').toUpperCase()) {
      case 'IN':
        return 'green';
      case 'OUT':
        return 'red';
      default:
        return 'default';
    }
  };

  // Get reference type color
  const getReferenceTypeColor = (type) => {
    switch (type) {
      case 'goods_receipt':
        return 'blue';
      case 'order_detail':
        return 'orange';
      case 'stock_transfer':
        return 'purple';
      case 'stock_take':
        return 'cyan';
      case 'order':
        return 'gold';
      case 'order_cancel':
        return 'red';
      case 'return_order':
        return 'volcano';
      default:
        return 'default';
    }
  };

  // Columns configuration
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left',
    },
    {
      title: 'Sản phẩm',
      dataIndex: ['product_variant_info', 'product_name'],
      key: 'product_name',
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500, color: '#1890ff' }}>
            {record.product_variant_info?.product_name || record.product_info?.name || text}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
            {record.product_variant_info?.sku}
          </div>
          {record.product_variant_info?.attribute_values_detail && (
            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
              {record.product_variant_info.attribute_values_detail.map(attr => 
                `${attr.attribute_type.name}: ${attr.value}`
              ).join(', ')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Cửa hàng',
      dataIndex: ['store_info', 'name'],
      key: 'store_name',
      width: 150,
      render: (text, record) => record.store_info?.name || 'Chưa có thông tin',
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'transaction_type',
      key: 'transaction_type',
      width: 120,
      render: (type) => (
        <Tag color={getTransactionTypeColor(type)}>
          {(type || '').toUpperCase() === 'IN' ? 'Nhập kho' : 'Xuất kho'}
        </Tag>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      render: (quantity, record) => (
        <span style={{ 
          color: (record.transaction_type || '').toUpperCase() === 'IN' ? '#52c41a' : '#ff4d4f',
          fontWeight: 500 
        }}>
          {(record.transaction_type || '').toUpperCase() === 'IN' ? '+' : '-'}{quantity}
        </span>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 120,
      align: 'right',
      render: (price) => (
        <div>
          <div>{new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(price)}</div>
          <div style={{ fontSize: '11px', color: '#999' }}>đơn vị</div>
        </div>
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 130,
      align: 'right',
      render: (subtotal, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(subtotal || (record.quantity * record.unit_price))}
          </div>
          <div style={{ fontSize: '11px', color: '#999' }}>
            ({record.quantity} × {new Intl.NumberFormat('vi-VN').format(record.unit_price)})
          </div>
        </div>
      ),
    },
    {
      title: 'Tham chiếu',
      dataIndex: 'reference_type',
      key: 'reference_type',
      width: 120,
      render: (type, record) => (
        <Tag color={getReferenceTypeColor(type)}>
          {type === 'goods_receipt' ? 'Phiếu nhập' :
           type === 'order_detail' ? 'Đơn hàng chi tiết' :
           type === 'stock_transfer' ? 'Chuyển kho' :
           type === 'stock_take' ? 'Kiểm kê' :
           type === 'order' ? 'Đơn hàng xuất kho' :
           type === 'order_cancel' ? 'Đơn hàng hủy' :
           type === 'return_order' ? 'Đơn trả hàng' :
           type}
        </Tag>
      ),
    },
    {
      title: 'Ngày giao dịch',
      dataIndex: 'transaction_date',
      key: 'transaction_date',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleString('vi-VN') : 'Chưa có ngày',
    },
    {
      title: 'Người tạo',
      dataIndex: ['employee_info', 'name'],
      key: 'created_by_username',
      width: 120,
      render: (text, record) => record.employee_info?.name || 'Chưa có thông tin',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            className="action-btn"
            onClick={() => handleViewDetails(record)}
          />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            className="action-btn"
            onClick={() => handleViewSummary(record)}
          />
        </Space>
      ),
    },
  ];

  // Modal chi tiết giao dịch
  const DetailModal = ({ visible, onClose, transaction }) => {
    if (!transaction) return null;

    return (
      <Modal
        title="Chi tiết giao dịch kho"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        <div className="detail-modal" style={{ padding: '16px 0' }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div className="detail-section" style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px' 
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#1890ff' }}>Thông tin giao dịch</h4>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>ID:</span>
                  <span className="value" style={{ fontWeight: 600 }}>{transaction.id}</span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Loại giao dịch:</span>
                  <span className="value">
                    <Tag color={getTransactionTypeColor(transaction.transaction_type)}>
                      {(transaction.transaction_type || '').toUpperCase() === 'IN' ? 'Nhập kho' : 'Xuất kho'}
                    </Tag>
                  </span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Số lượng:</span>
                  <span className="value" style={{ 
                    color: (transaction.transaction_type || '').toUpperCase() === 'IN' ? '#52c41a' : '#ff4d4f',
                    fontWeight: 500 
                  }}>
                    {(transaction.transaction_type || '').toUpperCase() === 'IN' ? '+' : '-'}{transaction.quantity}
                  </span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Đơn giá:</span>
                  <span className="value">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(transaction.unit_price)}
                  </span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Thành tiền:</span>
                  <span className="value" style={{ fontWeight: 500 }}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(transaction.subtotal || (transaction.quantity * transaction.unit_price))}
                  </span>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="detail-section" style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px' 
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#1890ff' }}>Thông tin tham chiếu</h4>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Loại tham chiếu:</span>
                  <span className="value">
                    <Tag color={getReferenceTypeColor(transaction.reference_type)}>
                      {transaction.reference_type === 'goods_receipt' ? 'Phiếu nhập' :
                       transaction.reference_type === 'order_detail' ? 'Đơn hàng chi tiết' :
                       transaction.reference_type === 'stock_transfer' ? 'Chuyển kho' :
                       transaction.reference_type === 'stock_take' ? 'Kiểm kê' :
                       transaction.reference_type === 'order' ? 'Đơn hàng xuất kho' :
                       transaction.reference_type === 'order_cancel' ? 'Đơn hàng hủy' :
                       transaction.reference_type === 'return_order' ? 'Đơn trả hàng' :
                       transaction.reference_type}
                    </Tag>
                  </span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>ID tham chiếu:</span>
                  <span className="value" style={{ fontWeight: 600 }}>{transaction.reference_id}</span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Ngày giao dịch:</span>
                  <span className="value">
                    {transaction.transaction_date ? 
                      new Date(transaction.transaction_date).toLocaleString('vi-VN') : 
                      'Chưa có ngày'
                    }
                  </span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Ghi chú:</span>
                  <span className="value">{transaction.note || 'Không có ghi chú'}</span>
                </div>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={24}>
              <div className="detail-section" style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px' 
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#1890ff' }}>Thông tin sản phẩm</h4>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Tên sản phẩm:</span>
                  <span className="value" style={{ fontWeight: 500 }}>
                    {transaction.product_variant_info?.product_name || transaction.product_info?.name || 'Chưa có thông tin'}
                  </span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>SKU:</span>
                  <span className="value">{transaction.product_variant_info?.sku || 'Chưa có thông tin'}</span>
                </div>
                {transaction.product_variant_info?.attribute_values_detail && (
                  <div className="detail-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px' 
                  }}>
                    <span className="label" style={{ fontWeight: 500, color: '#666' }}>Thuộc tính:</span>
                    <span className="value">
                      {transaction.product_variant_info.attribute_values_detail.map(attr => 
                        `${attr.attribute_type.name}: ${attr.value}`
                      ).join(', ')}
                    </span>
                  </div>
                )}
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Cửa hàng:</span>
                  <span className="value">{transaction.store_info?.name || 'Chưa có thông tin'}</span>
                </div>
              </div>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={12}>
              <div className="detail-section" style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px' 
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#1890ff' }}>Thông tin người tạo</h4>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Tên nhân viên:</span>
                  <span className="value">{transaction.employee_info?.name || 'Chưa có thông tin'}</span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Mã nhân viên:</span>
                  <span className="value">{transaction.employee_info?.employee_code || 'Chưa có thông tin'}</span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Vị trí:</span>
                  <span className="value">{transaction.employee_info?.position || 'Chưa có thông tin'}</span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Email:</span>
                  <span className="value">{transaction.employee_info?.email || 'Chưa có thông tin'}</span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Số điện thoại:</span>
                  <span className="value">{transaction.employee_info?.phone || 'Chưa có thông tin'}</span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Ngày tạo:</span>
                  <span className="value">
                    {new Date(transaction.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div className="detail-section" style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px' 
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#1890ff' }}>Thông tin cập nhật</h4>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Người cập nhật:</span>
                  <span className="value">{transaction.employee_info?.name || 'Chưa có thông tin'}</span>
                </div>
                <div className="detail-item" style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '12px' 
                }}>
                  <span className="label" style={{ fontWeight: 500, color: '#666' }}>Ngày cập nhật:</span>
                  <span className="value">
                    {transaction.updated_at ? 
                      new Date(transaction.updated_at).toLocaleString('vi-VN') : 
                      'Chưa cập nhật'
                    }
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>
    );
  };

  // Tính toán thống kê
  const calculateStats = () => {
    if (!transactions.length) return { totalIn: 0, totalOut: 0, totalValue: 0 };

    const stats = transactions.reduce((acc, transaction) => {
      const subtotal = transaction.subtotal || (transaction.quantity * transaction.unit_price);
      const type = (transaction.transaction_type || '').toUpperCase();
      if (type === 'IN') {
        acc.totalIn += transaction.quantity;
        acc.totalValue += subtotal;
      } else if (type === 'OUT') {
        acc.totalOut += transaction.quantity;
        acc.totalValue -= subtotal;
      }
      return acc;
    }, { totalIn: 0, totalOut: 0, totalValue: 0 });

    return stats;
  };

  const stats = calculateStats();

  return (
    <div className="inventory-transactions-page" style={{ padding: '24px' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>
          Lịch sử giao dịch kho
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          Quản lý và theo dõi tất cả giao dịch nhập/xuất kho
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section" style={{ 
        background: '#fff', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Input.Search
              placeholder="Tìm kiếm theo sản phẩm, SKU, ghi chú..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ width: '100%' }}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchTransactions()}
              className="admin-btn"
              style={{ width: '100%' }}
            >
              Làm mới
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button 
              onClick={() => setShowFilters(!showFilters)}
              icon={<FilterOutlined />} 
              style={{ width: '100%', background: showFilters ? '#52c41a' : '#1890ff', borderColor: showFilters ? '#52c41a' : '#1890ff', color: '#fff' }}
            >
              {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button 
              onClick={handleClearFilters}
              icon={<ClearOutlined />} 
              style={{ width: '100%', background: '#ff4d4f', borderColor: '#ff4d4f', color: '#fff' }}
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>

        {showFilters && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="Loại giao dịch"
                  value={transactionType}
                  onChange={(value) => handleFilterChange('transaction_type', value)}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Select.Option value="IN">Nhập kho</Select.Option>
                  <Select.Option value="OUT">Xuất kho</Select.Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="Loại tham chiếu"
                  value={referenceType}
                  onChange={(value) => handleFilterChange('reference_type', value)}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Select.Option value="goods_receipt">Phiếu nhập</Select.Option>
                  <Select.Option value="order_detail">Đơn hàng chi tiết</Select.Option>
                  <Select.Option value="order">Đơn hàng xuất kho</Select.Option>
                  <Select.Option value="order_cancel">Đơn hàng hủy</Select.Option>
                  <Select.Option value="return_order">Đơn trả hàng</Select.Option>
                  <Select.Option value="stock_transfer">Chuyển kho</Select.Option>
                  <Select.Option value="stock_take">Kiểm kê</Select.Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <DatePicker.RangePicker
                  placeholder={['Từ ngày', 'Đến ngày']}
                  value={dateRange}
                  onChange={(dates) => handleFilterChange('date_range', dates)}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Tổng giao dịch"
              value={summary?.total_transactions ?? total}
              suffix="giao dịch"
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Trang {currentPage} / {totalPages}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Tổng nhập kho"
              value={summary?.total_in ?? 0}
              valueStyle={{ color: '#52c41a' }}
              suffix="sản phẩm"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Tổng xuất kho"
              value={summary?.total_out ?? 0}
              valueStyle={{ color: '#ff4d4f' }}
              suffix="sản phẩm"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ textAlign: 'center' }}>
            <Statistic
              title="Chênh lệch"
              value={summary?.net_change ?? 0}
              valueStyle={{ color: '#1890ff' }}
              suffix="sản phẩm"
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <div className="table-section" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} của ${total} giao dịch`,
            pageSizeOptions: ['10', '20', '50', '100'],
            position: ['bottomCenter'],
            size: 'default',
            responsive: true,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          className="admin-table"
        />
      </div>

      {/* Detail Modal */}
      <DetailModal
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
        transaction={selectedTransaction}
      />

      {/* Summary Modal */}
      <Modal
        title="Thống kê giao dịch kho"
        open={summaryModalVisible}
        onCancel={() => setSummaryModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="summary-content">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card className="stat-card">
                <Statistic
                  title="Tổng nhập kho"
                  value={stats.totalIn}
                  valueStyle={{ color: '#52c41a' }}
                  suffix="sản phẩm"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="stat-card">
                <Statistic
                  title="Tổng xuất kho"
                  value={stats.totalOut}
                  valueStyle={{ color: '#ff4d4f' }}
                  suffix="sản phẩm"
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card className="stat-card">
                <Statistic
                  title="Giá trị tổng"
                  value={stats.totalValue}
                  valueStyle={{ color: '#1890ff' }}
                  prefix="₫"
                  formatter={(value) => new Intl.NumberFormat('vi-VN').format(value)}
                />
              </Card>
            </Col>
          </Row>

          <Divider />

          <div className="summary-details">
            <h4>Chi tiết theo loại giao dịch</h4>
            <Table
              dataSource={transactions}
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Loại',
                  dataIndex: 'transaction_type',
                  key: 'type',
                  render: (type) => (
                    <Tag color={getTransactionTypeColor(type)}>
                      {(type || '').toUpperCase() === 'IN' ? 'Nhập kho' : 'Xuất kho'}
                    </Tag>
                  ),
                },
                {
                  title: 'Sản phẩm',
                  dataIndex: ['product_variant_info', 'product_name'],
                  key: 'product',
                  render: (text, record) => 
                    record.product_variant_info?.product_name || record.product_info?.name || text,
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  align: 'right',
                },
                {
                  title: 'Thành tiền',
                  dataIndex: 'subtotal',
                  key: 'subtotal',
                  align: 'right',
                  render: (subtotal, record) => 
                    new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(subtotal || (record.quantity * record.unit_price)),
                },
              ]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryTransactionsPage; 