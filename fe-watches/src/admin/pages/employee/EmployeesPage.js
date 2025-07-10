import React, { useState, useEffect, useCallback } from 'react';
import { Table, Modal, Form, Input, DatePicker, Select, Space, Checkbox, AutoComplete, Tag, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { EMPLOYEE_ENDPOINTS, USER_ENDPOINTS, STORE_ENDPOINTS } from '@/config/api';
import '@/admin/static/AdminCommon.css';

// Import hooks
import { useAccessControl, usePagination, useApiCall, useSearchAndFilter, useCRUD } from '@/admin/hooks';

// Import components
import { AdminPageHeader, AccessDeniedAlert, CustomPagination, ActionButtons } from '@/admin/components';

const { Option } = Select;

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [stores, setStores] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [storeOptions, setStoreOptions] = useState([]);
  const [allStoreOptions, setAllStoreOptions] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const ITEMS_PER_PAGE = 20;
  const navigate = useNavigate();

  // 1. Khai báo hook ở top-level
  const { hasAccess, checkModulePermission } = useAccessControl('employee', 'view');
  const { currentPage, totalPages, setCurrentPage, setTotalPages } = usePagination(ITEMS_PER_PAGE);
  const { searchText, setSearchText, debouncedSearchText } = useSearchAndFilter();
  const { loading, get } = useApiCall();
  const { createData, updateData, deleteData } = useCRUD({
    baseUrl: EMPLOYEE_ENDPOINTS.EMPLOYEES,
    entityName: 'nhân viên',
    canCreate: checkModulePermission('employee', 'create'),
    canEdit: checkModulePermission('employee', 'edit'),
    canDelete: checkModulePermission('employee', 'delete')
  });

  // Fetch employees with pagination and search
  const fetchEmployees = useCallback(async () => {
    if (!hasAccess) return false;
    
    const params = {
      page: currentPage,
      page_size: ITEMS_PER_PAGE,
      search: debouncedSearchText
    };
    
    const result = await get(EMPLOYEE_ENDPOINTS.EMPLOYEES, params, 'Lỗi khi tải danh sách nhân viên');
    
    if (result.success && result.data) {
      const employeesData = Array.isArray(result.data.results) ? result.data.results : [];
      const count = result.data.count || 0;
      
      setEmployees(employeesData);
      setTotalPages(count, ITEMS_PER_PAGE);
      
      return true;
    } else {
      // Lỗi đã được xử lý trong useApiCall hook
      return false;
    }
  }, [debouncedSearchText, hasAccess, currentPage, get, setTotalPages]);

  // Fetch stores
  const fetchStores = async () => {
    if (!hasAccess) return;
    
    const result = await get(STORE_ENDPOINTS.STORES_LIST_ALL, {}, 'Lỗi khi tải danh sách cửa hàng');
    
    if (result.success && result.data) {
      setStores(result.data || []);
      const options = result.data.map(store => ({
        value: store.id,
        label: `${store.name} - ${store.address}`,
        store: store
      }));
      setAllStoreOptions(options);
      setStoreOptions(options);
    }
    // Lỗi đã được xử lý trong useApiCall hook
  };

  // Search users
  const searchUsers = async (value) => {
    if (!hasAccess) return;
    
    const result = await get(USER_ENDPOINTS.USERS_ALL, { search: value }, 'Lỗi khi tìm kiếm người dùng');
    
    if (result.success && result.data) {
      const options = result.data.map(user => ({
        value: user.id,
        label: `${user.username}${user.email ? ` (${user.email})` : ''}${user.groups.length > 0 ? ` - ${user.groups.map(g => g.name).join(', ')}` : ''}`,
        user: user
      }));
      setUserOptions(options);
    }
    // Lỗi đã được xử lý trong useApiCall hook
  };

  // 2. Khai báo useCallback, useEffect ở top-level
  useEffect(() => {
    if (!hasAccess) return;
    
    const fetchAll = async () => {
      const ok = await fetchEmployees();
      if (ok) {
        fetchStores();
      }
    };
    fetchAll();
  }, [debouncedSearchText, hasAccess, currentPage, fetchEmployees]);

  // 3. Sau khi khai báo hook, mới kiểm tra quyền
  if (!hasAccess) {
    return (
      <div className="admin-users-list">
        <AccessDeniedAlert 
          hasAccess={hasAccess} 
          module="employee"
          action="view"
          showUserInfo={true}
        />
      </div>
    );
  }

  // Handle form submission
  const handleSubmit = async (values) => {
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

    let success = false;
    if (editingId) {
      success = await updateData(editingId, formattedValues);
    } else {
      success = await createData(formattedValues);
    }

    if (success) {
      setModalVisible(false);
      form.resetFields();
      setSelectedUser(null);
      setSelectedStore(null);
      setStoreOptions(allStoreOptions);
      fetchEmployees();
    }
  };

  // Table columns configuration
  const columns = [
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
        <ActionButtons
          record={record}
          onEdit={() => {
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
          onDelete={async () => {
            const success = await deleteData(record.id);
            if (success) {
              fetchEmployees();
            }
          }}
          hasAccess={hasAccess}
          entityName="nhân viên"
        />
      ),
    },
  ];

  return (
    <div className="admin-users-list">
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="employee"
        action="view"
        showUserInfo={true}
      />
      
      <AdminPageHeader
        title="Quản lý nhân viên"
        searchText={searchText}
        onSearchChange={setSearchText}
        onAdd={() => {
          setEditingId(null);
          form.resetFields();
          setSelectedUser(null);
          setSelectedStore(null);
          setStoreOptions(allStoreOptions);
          setModalVisible(true);
        }}
        hasAccess={hasAccess}
        searchPlaceholder="Tìm kiếm nhân viên..."
        addButtonText="Thêm nhân viên"
      />

      <div className="table-responsive">
        <Table
          columns={columns}
          dataSource={employees}
          loading={loading}
          rowKey="id"
          pagination={false}
          className="admin-table"
          scroll={{ x: true }}
          size="middle"
        />
      </div>

      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        hasAccess={hasAccess}
      />

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
                form.setFieldsValue({ store: option.label });
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