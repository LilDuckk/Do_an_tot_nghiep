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
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [userSearchValue, setUserSearchValue] = useState('');
  const [userOptions, setUserOptions] = useState([]);

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
      const response = await fetch('http://localhost:8000/api/stores/stores/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStores(data.results || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách cửa hàng');
    }
  };

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/account/auth/groups/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setGroups(data.results || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách nhóm quyền');
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
        label: `${user.username}${user.email ? ` (${user.email})` : ''}${user.groups.length > 0 ? ` - ${user.groups.map(g => g.name).join(', ')}` : ''}`
      }));
      setUserOptions(options);
    } catch (error) {
      message.error('Lỗi khi tìm kiếm người dùng');
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchStores();
    fetchGroups();
  }, [fetchEmployees]);

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formattedValues = {
        user_id: values.user_id,
        first_name: values.first_name,
        last_name: values.last_name,
        phone: values.phone,
        address: values.address,
        employee_code: values.employee_code,
        position: values.position,
        hire_date: values.hire_date.format('YYYY-MM-DD'),
        store_id: values.store_id
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
      title: 'Mã nhân viên',
      dataIndex: 'employee_code',
      key: 'employee_code',
    },
    {
      title: 'Họ và tên',
      key: 'full_name',
      render: (_, record) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
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
      dataIndex: ['store', 'name'],
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
                hire_date: dayjs(record.hire_date),
                store_id: record.store.id,
                user_id: record.user.id
              });
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
        className="coupon-table"
      />

      <Modal
        title={editingId ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="user_id"
            label="Người dùng"
            rules={[{ required: true, message: 'Vui lòng chọn người dùng' }]}
          >
            <AutoComplete
              options={userOptions}
              onSearch={searchUsers}
              onChange={(value) => {
                form.setFieldsValue({ user_id: value });
                setUserSearchValue(value);
              }}
              placeholder="Tìm kiếm theo tên hoặc email..."
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="first_name"
            label="Họ"
            rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Tên"
            rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
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
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="employee_code"
            label="Mã nhân viên"
            rules={[{ required: true, message: 'Vui lòng nhập mã nhân viên' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="position"
            label="Chức vụ"
            rules={[{ required: true, message: 'Vui lòng chọn chức vụ' }]}
          >
            <Select>
              {groups.map(group => (
                <Option key={group.id} value={group.name}>
                  {group.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="hire_date"
            label="Ngày vào làm"
            rules={[{ required: true, message: 'Vui lòng chọn ngày vào làm' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="store_id"
            label="Cửa hàng"
            rules={[{ required: true, message: 'Vui lòng chọn cửa hàng' }]}
          >
            <Select>
              {stores.map(store => (
                <Option key={store.id} value={store.id}>
                  {store.name} - {store.store_code}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeesPage; 