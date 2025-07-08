import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Space,
  Popconfirm,
  AutoComplete,
  List,
  Card,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { INVENTORY_ENDPOINTS, STORE_ENDPOINTS, PRODUCT_ENDPOINTS } from '../../config/api';
import '../static/AdminCommon.css';

const { Option } = Select;

const InventoriesPage = () => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productVariants, setProductVariants] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [productSearchValue, setProductSearchValue] = useState('');
  const [productOptions, setProductOptions] = useState([]);
  const [selectedStoreFilter, setSelectedStoreFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const userPermissions = JSON.parse(localStorage.getItem('user_permission_codenames') || '[]');
  const isSuperUser = localStorage.getItem('is_superuser') === 'true';
  const canViewAllInventory = isSuperUser || userPermissions.includes('view_all_inventory');

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchInventories = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParamsObj = {
        page: currentPage,
        page_size: pageSize,
      };
      if (debouncedSearchText) queryParamsObj.search = debouncedSearchText;
      if (selectedStoreFilter) queryParamsObj.store = selectedStoreFilter;
      const queryParams = new URLSearchParams(queryParamsObj);
      const response = await fetch(`${INVENTORY_ENDPOINTS.INVENTORIES}?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 403) {
        message.error('Bạn không có quyền xem danh sách này.');
        setInventories([]);
        setTotal(0);
        setTotalPages(1);
        return;
      }
      const data = await response.json();
      setInventories(Array.isArray(data.results) ? data.results : []);
      setTotal(data.count || 0);
      setTotalPages(Math.max(1, Math.ceil((data.count || 0) / pageSize)));
      if ((data.count || 0) === 0 && currentPage !== 1) setCurrentPage(1);
    } catch (error) {
      message.error('Lỗi khi tải danh sách tồn kho');
      setInventories([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchText, selectedStoreFilter, currentPage, pageSize]);

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
      setStores([]);
    }
  };

  const searchProducts = async (value) => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        search: value
      });
      
      const response = await fetch(`${PRODUCT_ENDPOINTS.PRODUCTS}?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      const options = data.results.map(product => ({
        value: String(product.id),
        label: `${product.name} - ${product.brand_detail?.name || product.brand}`,
        product: product
      }));
      setProductOptions(options);
    } catch (error) {
      message.error('Lỗi khi tìm kiếm sản phẩm');
    }
  };

  const fetchProductVariants = async (productId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${PRODUCT_ENDPOINTS.PRODUCT_VARIANTS(productId)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProductVariants(data || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách biến thể');
    }
  };

  useEffect(() => {
    fetchInventories();
    fetchStores();
  }, [fetchInventories]);

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (editingId) {
        const formattedValues = {
          quantity: values.quantity
        };
        const response = await fetch(`${INVENTORY_ENDPOINTS.INVENTORY_DETAIL(editingId)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });
        if (!response.ok) {
          message.error('Có lỗi xảy ra khi cập nhật tồn kho');
          return;
        }
        message.success('Cập nhật tồn kho thành công');
      } else {
        const promises = selectedVariants.map(variant => {
          const formattedValues = {
            product_variant: variant.id,
            store: selectedStore?.id,
            quantity: variant.quantity
          };
          return fetch(INVENTORY_ENDPOINTS.INVENTORIES, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formattedValues),
          });
        });
        const responses = await Promise.all(promises);
        const hasError = responses.some(res => !res.ok);
        if (hasError) {
          message.error('Có lỗi xảy ra khi tạo tồn kho');
          return;
        }
        message.success('Tạo tồn kho mới thành công');
      }
      setModalVisible(false);
      form.resetFields();
      setSelectedStore(null);
      setSelectedProduct(null);
      setSelectedVariants([]);
      setProductVariants([]);
      fetchInventories();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${INVENTORY_ENDPOINTS.INVENTORY_DETAIL(id)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xóa tồn kho này.');
        return;
      }

      message.success('Xóa tồn kho thành công');
      fetchInventories();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  const handleEditInventory = (record) => {
    setEditingId(record.id);
    form.setFieldsValue({
      quantity: record.quantity,
      store: record.store_details?.name,
      product: `${record.product?.name || record.product_name || ''} - ${record.variant?.sku || record.sku || ''}`
    });
    setSelectedStore(record.store_details);

    setSelectedProduct({
      id: record.product?.id || record.product,
      name: record.product?.name || record.product_name
    });

    setSelectedVariants([
      {
        id: record.variant?.id || record.variant?.variant_id || record.variant || record.id,
        sku: record.variant?.sku || record.sku,
        quantity: record.quantity,
        attribute_values_detail: record.variant?.attribute_values_detail || record.attribute_values_detail || [],
        product_name: record.product?.name || record.product_name
      }
    ]);
    setModalVisible(true);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        Trước
      </button>
    );

    // First page
    if (startPage > 1) {
      pages.push(
        <button
          key="1"
          onClick={() => setCurrentPage(1)}
          className="pagination-btn"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="pagination-btn"
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key="next"
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        Sau
      </button>
    );

    return pages;
  };

  return (
    <div className="admin-users-list">
      <div className="admin-list-header">
        <h2>Quản lý tồn kho</h2>
        <div className="search-bar">
          {canViewAllInventory && (
            <Select
              placeholder="Chọn cửa hàng để lọc"
              allowClear
              style={{ width: 200 }}
              value={selectedStoreFilter}
              onChange={value => setSelectedStoreFilter(value)}
            >
              {Array.isArray(stores) && stores.map(store => (
                <Option key={store.id} value={store.id}>{store.name}</Option>
              ))}
            </Select>
          )}
          <Input
            placeholder="Tìm kiếm tồn kho..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setSelectedStore(null);
              setSelectedProduct(null);
              setSelectedVariants([]);
              setProductVariants([]);
              setModalVisible(true);
            }}
          >
            Thêm tồn kho
          </Button>
        </div>
      </div>

      <div className="table-container">
        <Table
          columns={[
            {
              title: 'Sản phẩm',
              dataIndex: ['product', 'name'],
              key: 'product_name',
              render: (_, record) => record.product?.name || record.product_name,
            },
            {
              title: 'Mã SKU',
              dataIndex: ['variant', 'sku'],
              key: 'sku',
              render: (_, record) => record.variant?.sku || record.sku,
            },
            {
              title: 'Thuộc tính',
              key: 'attribute_name',
              render: (_, record) => {
                const attrs = record.variant?.attribute_values_detail || record.attribute_values_detail || [];
                return (
                  <div>
                    {attrs.map((attr, idx) => (
                      <div key={idx}>{attr.attribute_type?.name || ''}</div>
                    ))}
                  </div>
                );
              }
            },
            {
              title: 'Giá trị thuộc tính',
              key: 'attribute_value',
              render: (_, record) => {
                const attrs = record.variant?.attribute_values_detail || record.attribute_values_detail || [];
                return (
                  <div>
                    {attrs.map((attr, idx) => (
                      <div key={idx}>{attr.value || ''}</div>
                    ))}
                  </div>
                );
              }
            },
            {
              title: 'Cửa hàng',
              dataIndex: ['store_details', 'name'],
              key: 'store',
            },
            {
              title: 'Số lượng',
              dataIndex: 'quantity',
              key: 'quantity',
            },
            {
              title: 'Cập nhật lần cuối',
              dataIndex: 'last_updated',
              key: 'last_updated',
              render: (date) => new Date(date).toLocaleString('vi-VN')
            },
            {
              title: 'Thao tác',
              key: 'action',
              render: (_, record) => (
                <Space>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => handleEditInventory(record)}
                  />
                  <Popconfirm
                    title="Bạn có chắc chắn muốn xóa?"
                    onConfirm={() => handleDelete(record.id)}
                  >
                    <Button danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={inventories}
          loading={loading}
          rowKey="id"
          pagination={false}
          className="admin-table"
        />
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Hiển thị {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, total)} của {total} tồn kho
          </div>
          <div className="pagination-controls">
            {renderPagination()}
          </div>
        </div>
      )}

      <Modal
        title={editingId ? "Sửa tồn kho" : "Thêm tồn kho mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedStore(null);
          setSelectedProduct(null);
          setSelectedVariants([]);
          setProductVariants([]);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="store"
            label="Cửa hàng"
            rules={[{ required: true, message: 'Vui lòng chọn cửa hàng' }]}
          >
            <Select
              placeholder="Chọn cửa hàng"
              onChange={(value) => {
                const store = stores.find(s => s.id === value);
                setSelectedStore(store);
              }}
              disabled={!!editingId}
            >
              {stores.map(store => (
                <Option key={store.id} value={store.id}>{store.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="product"
            label="Sản phẩm"
            rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
          >
            <AutoComplete
              options={productOptions}
              onSearch={searchProducts}
              onChange={(value) => {
                form.setFieldsValue({ product: value });
                setProductSearchValue(value);
              }}
              onSelect={(value, option) => {
                setSelectedProduct(option.product);
                fetchProductVariants(option.product.id);
                form.setFieldsValue({ product: option.label });
              }}
              placeholder="Tìm kiếm sản phẩm..."
              style={{ width: '100%' }}
              disabled={!!editingId}
            />
          </Form.Item>

          {selectedProduct && productVariants.length > 0 && (
            <Form.Item label="Biến thể sản phẩm">
              <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={productVariants}
                renderItem={variant => (
                  <List.Item>
                    <Card
                      size="small"
                      title={
                        <div>
                          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                            {variant.product_name || variant.product?.name || 'Sản phẩm'}
                          </div>
                          <div style={{ color: '#666' }}>
                            SKU: {variant.sku}
                          </div>
                        </div>
                      }
                      extra={
                        <Button
                          type={selectedVariants.some(v => v.id === variant.id) ? "primary" : "default"}
                          icon={selectedVariants.some(v => v.id === variant.id) ? <MinusCircleOutlined /> : <PlusCircleOutlined />}
                          onClick={() => {
                            if (!!editingId) return; // Không cho chọn khi sửa
                            if (selectedVariants.some(v => v.id === variant.id)) {
                              setSelectedVariants(prev => prev.filter(v => v.id !== variant.id));
                            } else {
                              setSelectedVariants(prev => [...prev, { id: variant.id, sku: variant.sku, quantity: 0 }]);
                            }
                          }}
                          disabled={!!editingId}
                        >
                          {selectedVariants.some(v => v.id === variant.id) ? 'Bỏ chọn' : 'Chọn'}
                        </Button>
                      }
                    >
                      <div style={{ marginBottom: 8 }}>
                        {Array.isArray(variant.attribute_values_detail) && variant.attribute_values_detail.length > 0 ? (
                          variant.attribute_values_detail.map((attr, idx) => {
                            const attributeType = attr.attribute_type || {};
                            return (
                              <div
                                key={attr.id || `${attributeType.name || 'attr'}-${attr.value}-${idx}`}
                                style={{
                                  marginBottom: 4,
                                  padding: '4px 8px',
                                  backgroundColor: '#f5f5f5',
                                  borderRadius: 4
                                }}
                              >
                                <span style={{ fontWeight: 'bold', marginRight: 8 }}>
                                  {attributeType.name || 'Thuộc tính'}:
                                </span>
                                <span>{attr.value || ''}</span>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ color: '#888', fontStyle: 'italic' }}>Không có thuộc tính</div>
                        )}
                      </div>
                      {selectedVariants.some(v => v.id === variant.id) && (
                        <Form.Item
                          label="Số lượng"
                          required
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber
                            min={0}
                            value={selectedVariants.find(v => v.id === variant.id)?.quantity}
                            onChange={(value) => {
                              setSelectedVariants(prev =>
                                prev.map(v =>
                                  v.id === variant.id ? { ...v, quantity: value } : v
                                )
                              );
                            }}
                            style={{ width: '100%' }}
                            disabled={!!editingId ? selectedVariants[0]?.id !== variant.id : false}
                          />
                        </Form.Item>
                      )}
                    </Card>
                  </List.Item>
                )}
              />
            </Form.Item>
          )}

          {editingId && (
            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" disabled={selectedVariants.length === 0}>
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setSelectedStore(null);
                setSelectedProduct(null);
                setSelectedVariants([]);
                setProductVariants([]);
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoriesPage; 