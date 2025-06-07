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
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import '../static/AdminCommon.css';

const { Option } = Select;

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [managers, setManagers] = useState([]);

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams();
      if (debouncedSearchText) {
        queryParams.append('search', debouncedSearchText);
      }
      
      const response = await fetch(`http://localhost:8000/api/stores/stores/?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xem danh sách này.');
        setStores([]);
        return;
      }

      const data = await response.json();
      setStores(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách cửa hàng');
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchText]);

  const fetchManagers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/stores/employees/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setManagers(data.results || []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách quản lý');
    }
  };

  useEffect(() => {
    fetchStores();
    fetchManagers();
  }, [fetchStores]);

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formattedValues = {
        name: values.name,
        address: values.address,
        phone: values.phone,
        store_code: values.store_code,
        opening_date: values.opening_date.format('YYYY-MM-DD'),
        is_active: values.is_active,
        manager: values.manager
      };

      if (editingId) {
        const response = await fetch(`http://localhost:8000/api/stores/stores/${editingId}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });

        if (response.status === 403) {
          message.error('Bạn không có quyền cập nhật cửa hàng này.');
          return;
        }

        message.success('Cập nhật cửa hàng thành công');
      } else {
        const response = await fetch('http://localhost:8000/api/stores/stores/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });

        if (response.status === 403) {
          message.error('Bạn không có quyền tạo cửa hàng mới.');
          return;
        }

        message.success('Tạo cửa hàng mới thành công');
      }
      setModalVisible(false);
      form.resetFields();
      fetchStores();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/stores/stores/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xóa cửa hàng này.');
        return;
      }

      message.success('Xóa cửa hàng thành công');
      fetchStores();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  const columns = [
    {
      title: 'Mã cửa hàng',
      dataIndex: 'store_code',
      key: 'store_code',
    },
    {
      title: 'Tên cửa hàng',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Ngày khai trương',
      dataIndex: 'opening_date',
      key: 'opening_date',
    },
    {
      title: 'Quản lý',
      dataIndex: ['manager', 'first_name'],
      key: 'manager',
      render: (_, record) => 
        record.manager ? `${record.manager.first_name} ${record.manager.last_name}` : '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (active ? 'Hoạt động' : 'Không hoạt động'),
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
                opening_date: dayjs(record.opening_date),
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
        <h2>Quản lý cửa hàng</h2>
        <Space>
          <Input
            placeholder="Tìm kiếm cửa hàng..."
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
            Thêm cửa hàng
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={stores}
        loading={loading}
        rowKey="id"
        className="coupon-table"
      />

      <Modal
        title={editingId ? 'Chỉnh sửa cửa hàng' : 'Thêm cửa hàng mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Tên cửa hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
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
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="store_code"
            label="Mã cửa hàng"
            rules={[{ required: true, message: 'Vui lòng nhập mã cửa hàng' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="opening_date"
            label="Ngày khai trương"
            rules={[{ required: true, message: 'Vui lòng chọn ngày khai trương' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="manager"
            label="Quản lý"
            rules={[{ required: true, message: 'Vui lòng chọn quản lý' }]}
          >
            <Select>
              {managers.map(manager => (
                <Option key={manager.id} value={manager.id}>
                  {manager.first_name} {manager.last_name} - {manager.employee_code}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Trạng thái"
            initialValue={true}
          >
            <Select>
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Không hoạt động</Option>
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

export default StoresPage; 