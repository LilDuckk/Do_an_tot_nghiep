import React, { useState, useEffect, useCallback } from 'react';
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
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
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
  const [storeSearchValue, setStoreSearchValue] = useState('');
  const [storeOptions, setStoreOptions] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams();
      if (debouncedSearchText) {
        queryParams.append('search', debouncedSearchText);
      }
      
      const response = await fetch(`http://localhost:8000/api/stores/employees/?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xem danh sách này.');
        setEmployees([]);
        return;
      }

      const data = await response.json();
      setEmployees(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách nhân viên');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchText]);

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/stores/stores/list_all/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStores(data || []);
      // Tạo options cho AutoComplete
      const options = data.map(store => ({
        value: store.id,
        label: `${store.name} - ${store.address}`,
        store: store
      }));
      setStoreOptions(options);
    } catch (error) {
      message.error('Lỗi khi tải danh sách cửa hàng');
    }
  };

  const searchUsers = async (value) => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        search: value
      });
      
      const response = await fetch(`http://localhost:8000/api/account/users/all/?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
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
    fetchEmployees();
    fetchStores();
  }, [fetchEmployees]);

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formattedValues = {
        name: values.name,
        phone: values.phone,
        email: values.email,
        address: values.address,
        hire_date: values.hire_date?.format('YYYY-MM-DD'),
        store: selectedStore?.id,
        auto_create: selectedUser ? true : (values.auto_create || false),
        user: selectedUser?.id
      };

      if (editingId) {
        const response = await fetch(`http://localhost:8000/api/stores/employees/${editingId}/`, {
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
        const response = await fetch('http://localhost:8000/api/stores/employees/', {
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
      const response = await fetch(`http://localhost:8000/api/stores/employees/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xóa nhân viên này.');
        return;
      }

      message.success('Xóa nhân viên thành công');
      fetchEmployees();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

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
      key: 'user',
      render: (_, record) => record.user_details?.username || '-'
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Mã nhân viên',
      dataIndex: 'employee_code',
      key: 'employee_code',
    },
    {
      title: 'Chức vụ',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Ngày vào làm',
      dataIndex: 'hire_date',
      key: 'hire_date',
    },
    {
      title: 'Cửa hàng',
      dataIndex: ['store_details', 'name'],
      key: 'store',
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
              setModalVisible(true);
            }}
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
  ];

  return (
    <div className="coupon-page">
      <div className="coupon-header">
        <h2>Quản lý nhân viên</h2>
        <Space>
          <Input
            placeholder="Tìm kiếm nhân viên..."
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
              setSelectedUser(null);
              setSelectedStore(null);
              setModalVisible(true);
            }}
          >
            Thêm nhân viên
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={employees}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editingId ? "Sửa nhân viên" : "Thêm nhân viên mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedUser(null);
          setSelectedStore(null);
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
          >
            <AutoComplete
              options={storeOptions}
              onSearch={(value) => {
                const filteredOptions = storeOptions.filter(option =>
                  option.label.toLowerCase().includes(value.toLowerCase())
                );
                setStoreOptions(filteredOptions);
              }}
              onChange={(value) => {
                form.setFieldsValue({ store: value });
                setStoreSearchValue(value);
                if (!value) {
                  setSelectedStore(null);
                }
              }}
              onSelect={(value, option) => {
                setSelectedStore(option.store);
                form.setFieldsValue({ store: option.label });
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