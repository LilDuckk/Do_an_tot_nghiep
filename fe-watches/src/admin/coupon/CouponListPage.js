import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  message,
  Space,
  Popconfirm,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import '../static/AdminCommon.css';

const { Option } = Select;

const CouponListPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams();
      if (debouncedSearchText) {
        queryParams.append('search', debouncedSearchText);
      }
      
      const response = await fetch(`http://localhost:8000/api/orders/coupons/?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xem danh sách này.');
        setCoupons([]);
        return;
      }

      const data = await response.json();
      setCoupons(Array.isArray(data.results) ? data.results : []);
    } catch (error) {
      message.error('Lỗi khi tải danh sách mã giảm giá');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchText]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formattedValues = {
        code: values.code,
        description: values.description,
        discount_type: values.discount_type,
        discount_value: values.discount_value,
        minimum_order_amount: values.minimum_order_amount,
        start_date: values.start_date.format('YYYY-MM-DD'),
        expires_at: values.expires_at.format('YYYY-MM-DD'),
        usage_limit: values.usage_limit,
        is_active: values.is_active
      };

      if (editingId) {
        const response = await fetch(`http://localhost:8000/api/orders/coupons/${editingId}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });

        if (response.status === 403) {
          message.error('Bạn không có quyền cập nhật mã giảm giá này.');
          return;
        }

        message.success('Cập nhật mã giảm giá thành công');
      } else {
        const response = await fetch('http://localhost:8000/api/orders/coupons/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formattedValues),
        });

        if (response.status === 403) {
          message.error('Bạn không có quyền tạo mã giảm giá mới.');
          return;
        }

        message.success('Tạo mã giảm giá thành công');
      }
      setModalVisible(false);
      form.resetFields();
      fetchCoupons();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/orders/coupons/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        message.error('Bạn không có quyền xóa mã giảm giá này.');
        return;
      }

      message.success('Xóa mã giảm giá thành công');
      fetchCoupons();
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa');
    }
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Loại giảm giá',
      dataIndex: 'discount_type',
      key: 'discount_type',
      render: (type) => (type === 'percentage' ? 'Phần trăm' : 'Cố định'),
    },
    {
      title: 'Giá trị giảm',
      dataIndex: 'discount_value',
      key: 'discount_value',
      render: (value, record) =>
        record.discount_type === 'percentage' ? `${value}%` : `${value}đ`,
    },
    {
      title: 'Đơn hàng tối thiểu',
      dataIndex: 'minimum_order_amount',
      key: 'minimum_order_amount',
      render: (value) => `${value}đ`,
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'start_date',
      key: 'start_date',
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'expires_at',
      key: 'expires_at',
    },
    {
      title: 'Giới hạn sử dụng',
      dataIndex: 'usage_limit',
      key: 'usage_limit',
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
                start_date: dayjs(record.start_date),
                expires_at: dayjs(record.expires_at),
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
        <h2>Quản lý mã giảm giá</h2>
        <Space>
          <Input
            placeholder="Tìm kiếm mã giảm giá..."
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
            Thêm mã giảm giá
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={coupons}
        loading={loading}
        rowKey="id"
        className="coupon-table"
      />

      <Modal
        title={editingId ? 'Chỉnh sửa mã giảm giá' : 'Thêm mã giảm giá mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="code"
            label="Mã"
            rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="discount_type"
            label="Loại giảm giá"
            rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
          >
            <Select>
              <Option value="percentage">Phần trăm</Option>
              <Option value="fixed">Cố định</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="discount_value"
            label="Giá trị giảm"
            rules={[
              { required: true, message: 'Vui lòng nhập giá trị giảm' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue('discount_type') === 'percentage' && value > 100) {
                    return Promise.reject(new Error('Giảm giá theo phần trăm không được vượt quá 100%'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="minimum_order_amount"
            label="Đơn hàng tối thiểu"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị tối thiểu' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="expires_at"
            label="Ngày kết thúc"
            rules={[
              { required: true, message: 'Vui lòng chọn ngày kết thúc' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (value && getFieldValue('start_date') && value.isBefore(getFieldValue('start_date'))) {
                    return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="usage_limit"
            label="Giới hạn sử dụng"
            rules={[{ required: true, message: 'Vui lòng nhập giới hạn sử dụng' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
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

export default CouponListPage; 