import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Space,
  Popconfirm,
  Checkbox,
  AutoComplete,
  Alert,
  Tag,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { EMPLOYEE_ENDPOINTS, USER_ENDPOINTS, STORE_ENDPOINTS } from '../../config/api';
import '../static/AdminCommon.css';

const { Option } = Select;

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [stores, setStores] = useState([]);
  const [userSearchValue, setUserSearchValue] = useState('');
  const [userOptions, setUserOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [storeOptions, setStoreOptions] = useState([]);
  const [allStoreOptions, setAllStoreOptions] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [hasAccess, setHasAccess] = useState(true);
  const accessErrorShown = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const navigate = useNavigate();

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchText]);

  const showAccessError = useCallback((msg) => {
    if (!accessErrorShown.current) {
      message.error(msg);
      accessErrorShown.current = true;
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    if (!hasAccess || accessErrorShown.current) return false;
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: currentPage,
        page_size: ITEMS_PER_PAGE,
        search: debouncedSearchText
      });
      const response = await fetch(`${EMPLOYEE_ENDPOINTS.EMPLOYEES}/?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 403) {
        setHasAccess(false);
        showAccessError('Bạn không có quyền xem danh sách nhân viên.');
        setEmployees([]);
        setTotalPages(1);
        return false;
      }
      const data = await response.json();
      
      // API hỗ trợ phân trang với count và results
      const employeesData = Array.isArray(data.results) ? data.results : [];
      const count = data.count || 0;
      setEmployees(employeesData);
      
      // Tính toán tổng số trang
      if (count === 0) {
        setTotalPages(1);
        if (currentPage !== 1) setCurrentPage(1);
      } else {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
      return true;
    } catch (error) {
      message.error('Lỗi khi tải danh sách nhân viên');
      setEmployees([]);
      setTotalPages(1);
      return false;
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchText, hasAccess, showAccessError, currentPage]);

  const fetchStores = async () => {
    if (!hasAccess || accessErrorShown.current) return;
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(STORE_ENDPOINTS.STORES_LIST_ALL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 403) {
        setHasAccess(false);
        showAccessError('Bạn không có quyền xem danh sách cửa hàng.');
        return;
      }
      const data = await response.json();
      setStores(data || []);
      const options = data.map(store => ({
        value: store.id,
        label: `${store.name} - ${store.address}`,
        store: store
      }));
      setAllStoreOptions(options);
      setStoreOptions(options);
    } catch (error) {
      message.error('Lỗi khi tải danh sách cửa hàng');
    }
  };

  const searchUsers = async (value) => {
    if (!hasAccess || accessErrorShown.current) return;
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        search: value
      });
      const response = await fetch(`${USER_ENDPOINTS.USERS_ALL}/?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 403) {
        setHasAccess(false);
        showAccessError('Bạn không có quyền tìm kiếm người dùng.');
        return;
      }
      const data = await response.json();
      const options = data.map(user => ({
        value: user.id,
        label: `${user.username}${user.email ? ` (${user.email})` : ''}${user.groups.length > 0 ? ` - ${user.groups.map(g => g.name).join(', ')}` : ''}`,
        user: user
      }));
      setUserOptions(options);
    } catch (error) {
      message.error('Lỗi khi tìm kiếm người dùng');
    }
  };

  useEffect(() => {
    if (!hasAccess || accessErrorShown.current) return;
    const fetchAll = async () => {
      const ok = await fetchEmployees();
      if (ok) {
        fetchStores();
      }
    };
    fetchAll();
  }, [fetchEmployees, hasAccess]);

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formattedValues = {
        name: values.name,
        phone: values.phone,
        email: values.email,
        address: values.address,
        hire_date: values.hire_date?.format('YYYY-MM-DD'),
        store: selectedStore?.id || values.store,
        auto_create: selectedUser ? true : (values.auto_create || false),
        user: selectedUser?.id,
        is_manager: values.is_manager || false,
        position: values.position || 'Nhân viên bán hàng'
      };

      if (editingId) {
        const response = await fetch(EMPLOYEE_ENDPOINTS.EMPLOYEE_DETAIL(editingId), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });

        if (response.status === 403) {
          message.error('Bạn không có quyền cập nhật nhân viên này.');
          return;
        }

        message.success('Cập nhật nhân viên thành công');
      } else {
        const response = await fetch(EMPLOYEE_ENDPOINTS.EMPLOYEES, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });

        if (response.status === 403) {
          message.error('Bạn không có quyền tạo nhân viên mới.');
          return;
        }

        message.success('Tạo nhân viên mới thành công');
      }
      setModalVisible(false);
      form.resetFields();
      setSelectedUser(null);
      setSelectedStore(null);
      fetchEmployees();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(EMPLOYEE_ENDPOINTS.EMPLOYEE_DETAIL(id), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xóa nhân viên này.');
        return;
      }

      message.success('Xóa nhân viên thành công');
      if (!hasAccess || accessErrorShown.current) return;
      fetchEmployees();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  const renderPagination = () => {
    if (!employees.length) {
      return (
        <div className="admin-pagination">
          <button disabled>Trước</button>
          <div className="page-numbers"><button className="active" disabled>1</button></div>
          <button disabled>Sau</button>
          <span className="page-info">Trang 1 / 1</span>
        </div>
      );
    }
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={currentPage === i ? 'active' : ''}
          disabled={currentPage === i || !hasAccess}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="admin-pagination">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || !hasAccess}>Trước</button>
        <div className="page-numbers">{pages}</div>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || !hasAccess}>Sau</button>
        <span className="page-info">Trang {currentPage} / {totalPages}</span>
      </div>
    );
  };



  return (
    <div className="admin-users-list">
      {!hasAccess && (
        <Alert
          message="Không có quyền truy cập"
          description="Bạn không có quyền xem hoặc thực hiện các thao tác trên trang này. Vui lòng liên hệ quản trị viên để được cấp quyền."
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <div className="admin-list-header">
        <h2>Quản lý nhân viên</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm nhân viên..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            disabled={!hasAccess}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setSelectedUser(null);
              setSelectedStore(null);
              setStoreOptions(allStoreOptions);
              setModalVisible(true);
            }}
            disabled={!hasAccess}
          >
            Thêm nhân viên
          </Button>
        </div>
      </div>

      <div className="table-responsive">
        <Table
          columns={[
            {
              title: 'Họ và tên',
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: 'Số điện thoại',
              dataIndex: 'phone',
              key: 'phone',
            },
            {
              title: 'Email',
              dataIndex: 'email',
              key: 'email',
            },
            {
              title: 'Tài khoản',
              dataIndex: ['user_details', 'username'],
              key: 'username',
              render: (username, record) => {
                if (username && record.user_details) {
                  return (
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate(`/admin/users/${record.user_details.id}`)}
                      onMouseEnter={(e) => {
                        e.target.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.textDecoration = 'none';
                      }}
                    >
                      <UserOutlined style={{ marginRight: '8px' }} />
                      <Tag color="blue">{username}</Tag>
                    </div>
                  );
                }
                return <Tag color="default">Chưa có tài khoản</Tag>;
              },
            },
            {
              title: 'Mã nhân viên',
              dataIndex: 'employee_code',
              key: 'employee_code',
            },
            {
              title: 'Vị trí',
              dataIndex: 'is_manager',
              key: 'is_manager',
              render: (isManager) => isManager ? 'Quản lý' : 'Nhân viên',
            },
            {
              title: 'Ngày vào làm',
              dataIndex: 'hire_date',
              key: 'hire_date',
            },
            {
              title: 'Cửa hàng',
              dataIndex: ['store_details', 'name'],
              key: 'store_name',
              render: (storeName) => storeName || '-',
            },
            {
              title: 'Thao tác',
              key: 'action',
              render: (_, record) => (
                <Space>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingId(record.id);
                      form.setFieldsValue({
                        ...record,
                        hire_date: record.hire_date ? dayjs(record.hire_date) : null,
                        store: record.store_details ? `${record.store_details.name} - ${record.store_details.address}` : undefined,
                        user: record.user_details ? `${record.user_details.username}${record.user_details.email ? ` (${record.user_details.email})` : ''}` : undefined
                      });
                      setSelectedUser(record.user_details);
                      setSelectedStore(record.store_details);
                      setStoreOptions(allStoreOptions);
                      setModalVisible(true);
                    }}
                    disabled={!hasAccess}
                  />
                  <Popconfirm
                    title="Bạn có chắc chắn muốn xóa?"
                    onConfirm={() => handleDelete(record.id)}
                  >
                    <Button danger icon={<DeleteOutlined />} disabled={!hasAccess} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={employees}
          loading={loading}
          rowKey="id"
          pagination={false}
          className="admin-table"
          scroll={{ x: true }}
          size="middle"
        />
      </div>
      {renderPagination()}

      <Modal
        title={editingId ? "Sửa nhân viên" : "Thêm nhân viên mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedUser(null);
          setSelectedStore(null);
          setStoreOptions(allStoreOptions);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="user"
            label="Tài khoản"
          >
            <AutoComplete
              options={userOptions}
              onSearch={searchUsers}
              onChange={(value) => {
                form.setFieldsValue({ 
                  user: value,
                  auto_create: value ? true : false 
                });
                setUserSearchValue(value);
                if (!value) {
                  setSelectedUser(null);
                }
              }}
              onSelect={(value, option) => {
                setSelectedUser(option.user);
                form.setFieldsValue({ 
                  user: option.label,
                  auto_create: true 
                });
              }}
              placeholder="Tìm kiếm tài khoản..."
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="hire_date"
            label="Ngày vào làm"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="store"
            label="Cửa hàng"
            rules={[{ required: true, message: 'Vui lòng chọn cửa hàng' }]}
          >
            <AutoComplete
              options={storeOptions}
              onSearch={(value) => {
                if (!value) {
                  setStoreOptions(allStoreOptions);
                } else {
                  const filteredOptions = allStoreOptions.filter(option =>
                    option.label.toLowerCase().includes(value.toLowerCase())
                  );
                  setStoreOptions(filteredOptions);
                }
              }}
              onSelect={(value, option) => {
                setSelectedStore(option.store);
                form.setFieldsValue({ store: option.label }); // hiển thị tên trong form
              }}
              onChange={(value) => {
                if (!value) {
                  setSelectedStore(null);
                  setStoreOptions(allStoreOptions);
                  form.setFieldsValue({ store: undefined });
                }
              }}
              placeholder="Tìm kiếm cửa hàng..."
              style={{ width: '100%' }}
            />
          </Form.Item>



          <Form.Item
            name="auto_create"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox disabled={!!selectedUser}>Tự động tạo tài khoản</Checkbox>
          </Form.Item>

          <Form.Item
            name="is_manager"
            label="Vị trí"
            initialValue={false}
          >
            <Select>
              <Option value={true}>Quản lý</Option>
              <Option value={false}>Nhân viên</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="position"
            label="Chức vụ"
            initialValue="Nhân viên bán hàng"
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setSelectedUser(null);
                setSelectedStore(null);
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

export default EmployeesPage; 