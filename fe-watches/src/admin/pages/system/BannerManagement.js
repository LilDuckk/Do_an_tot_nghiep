import React, { useState, useCallback } from 'react';
import { Input, Button, Empty, Table, Space, Modal, Form, Select, DatePicker } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { CONTENT_ENDPOINTS } from '@/config/api';
import { useListData, useCRUD, useAccessControl, useImages } from '@/admin/hooks';
import { AccessDeniedAlert, CustomPagination, ActionButtons, ImageManager } from '@/admin/components';
import '@/admin/static/AdminCommon.css';

const { Option } = Select;
  // const { TextArea } = Input;

export default function BannerManagement() {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // Hook tích hợp cho danh sách banners
  const {
    data: banners,
    isLoading,
    hasAccess,
    searchText,
    setSearchText,
    currentPage,
    setCurrentPage,
    totalPages,
    total,
    hasNext,
    hasPrevious,
    fetchData: fetchBanners
  } = useListData({
    module: 'content',
    action: 'view',
    apiEndpoint: CONTENT_ENDPOINTS.BANNERS,
    pageSize: 20,
    debounceDelay: 500
  });

  // CRUD operations với kiểm tra quyền
  const { createData, updateData, deleteData } = useCRUD({
    baseUrl: CONTENT_ENDPOINTS.BANNERS,
    entityName: 'banner',
    canCreate: hasAccess,
    canEdit: hasAccess,
    canDelete: hasAccess
  });

  // Access control cho các action cụ thể
  const { checkModulePermission } = useAccessControl();

  // Hook xử lý ảnh
  const {
    uploadingImages,
    handleImageUpload,
    handleDeleteImage,
    handleUpdateImageAltText
  } = useImages(
    editingId,
    editingId ? `${CONTENT_ENDPOINTS.BANNERS}${editingId}/upload_images/` : null,
    editingId ? `${CONTENT_ENDPOINTS.BANNERS}${editingId}/delete_image/` : null,
    (imageId) => `${CONTENT_ENDPOINTS.BANNERS}${editingId}/images/${imageId}/`,
    fetchBanners
  );

  const handleDelete = useCallback(async (record) => {
    const success = await deleteData(record.id);
    if (success) {
      fetchBanners();
    }
  }, [deleteData, fetchBanners]);

  const handleEdit = useCallback((record) => {
    console.log('Editing banner:', record);
    setEditingId(record.id);
    form.setFieldsValue({
      title: record.title,
      link_url: record.link_url,
      alt_text: record.alt_text,
      start_date: record.start_date ? dayjs(record.start_date) : null,
      end_date: record.end_date ? dayjs(record.end_date) : null,
      display_order: record.display_order,
      is_active: record.is_active,
      banner_location: record.banner_location
    });
    setModalVisible(true);
  }, [form]);

  const handleAdd = useCallback(() => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  const handleSubmit = useCallback(async (values) => {
    const formattedValues = {
      title: values.title,
      link_url: values.link_url,
      alt_text: values.alt_text,
      start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
      end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
      display_order: Number(values.display_order),
      is_active: values.is_active,
      banner_location: values.banner_location
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
      setEditingId(null);
      fetchBanners();
    }
  }, [editingId, updateData, createData, form, fetchBanners]);

  // Định nghĩa columns cho Ant Design Table
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 120,
      render: (imageUrl, record) => (
        <ImageManager
          images={[{ id: record.id, image: record.image || record.image_url, alt_text: record.alt_text }]}
          entityId={record.id}
          isEditing={false}
          uploadingImages={uploadingImages}
          onImageUpload={handleImageUpload}
          onDeleteImage={handleDeleteImage}
          onUpdateAltText={handleUpdateImageAltText}
          title="Quản lý ảnh banner"
          entityName="banner"
          imageSize={{ width: 80, height: 60 }}
          popupImageSize={{ width: 200, height: 150 }}
          columnWidth={120}
        />
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (title, record) => (
        <div className="banner-title">
          <div style={{ fontWeight: 'bold' }}>{title}</div>
          {record.link_url && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              Link: {record.link_url}
            </div>
          )}
          {record.alt_text && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              Alt: {record.alt_text}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Vị trí',
      dataIndex: 'banner_location',
      key: 'banner_location',
      width: 120,
      render: (location) => (
        <div className="banner-location">
          {location}
        </div>
      ),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'display_order',
      key: 'display_order',
      width: 100,
      render: (order) => (
        <div className="banner-order">
          {order}
        </div>
      ),
    },
    {
      title: 'Ngày hiển thị',
      key: 'date_range',
      width: 150,
      render: (_, record) => (
        <div className="banner-dates">
          {record.start_date && (
            <div style={{ fontSize: '12px' }}>
              Từ: {new Date(record.start_date).toLocaleDateString('vi-VN')}
            </div>
          )}
          {record.end_date && (
            <div style={{ fontSize: '12px' }}>
              Đến: {new Date(record.end_date).toLocaleDateString('vi-VN')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      render: (isActive) => (
        <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
          {isActive ? 'Hoạt động' : 'Ẩn'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <ActionButtons
          record={record}
          onView={() => handleEdit(record)}
          onEdit={() => handleEdit(record)}
          onDelete={() => handleDelete(record)}
          hasAccess={hasAccess}
          showView={false}
          showEdit={checkModulePermission('content', 'edit')}
          showDelete={checkModulePermission('content', 'delete')}
          entityName="banner"
        />
      ),
    },
  ];

  return (
    <div className="admin-banner-management">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="content"
        action="view"
        showUserInfo={false}
      />
      <div className="admin-list-header">
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm banner..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            disabled={!hasAccess}
          />
          {checkModulePermission('content', 'create') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Thêm banner mới
            </Button>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={banners}
        loading={isLoading}
        rowKey="id"
        className="banner-table"
        scroll={{ x: 1200 }}
        pagination={false}
        locale={{
          emptyText: (
            <Empty 
              description="Không có dữ liệu" 
              imageStyle={{ height: 60 }} 
            />
          )
        }}
      />

      {/* Pagination */}
      <CustomPagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        onPageChange={setCurrentPage}
        hasAccess={hasAccess}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />

      {/* Modal cho thêm/sửa banner */}
      <Modal
        title={editingId ? 'Chỉnh sửa banner' : 'Thêm banner mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
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
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề banner" />
          </Form.Item>

          <Form.Item
            name="link_url"
            label="Đường dẫn liên kết"
          >
            <Input placeholder="Nhập URL liên kết (không bắt buộc)" />
          </Form.Item>

          <Form.Item
            name="alt_text"
            label="Alt text"
          >
            <Input placeholder="Nhập alt text cho ảnh" />
          </Form.Item>

          <Form.Item
            name="banner_location"
            label="Vị trí hiển thị"
            rules={[{ required: true, message: 'Vui lòng chọn vị trí hiển thị' }]}
          >
            <Select placeholder="Chọn vị trí hiển thị">
              <Option value="homepage">Trang chủ</Option>
              <Option value="category">Trang danh mục</Option>
              <Option value="product">Trang sản phẩm</Option>
              <Option value="about">Trang giới thiệu</Option>
              <Option value="contact">Trang liên hệ</Option>
              <Option value="hot">Mục sản phẩm hot</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="display_order"
            label="Thứ tự hiển thị"
            rules={[{ required: true, message: 'Vui lòng nhập thứ tự hiển thị' }]}
          >
            <Input type="number" placeholder="Nhập thứ tự hiển thị" min="1" />
          </Form.Item>

          <Form.Item
            name="start_date"
            label="Ngày bắt đầu hiển thị"
          >
            <DatePicker 
              placeholder="Chọn ngày bắt đầu" 
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="Ngày kết thúc hiển thị"
          >
            <DatePicker 
              placeholder="Chọn ngày kết thúc" 
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Select placeholder="Chọn trạng thái">
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Ẩn</Option>
            </Select>
          </Form.Item>

          {/* Phần quản lý ảnh cho banner đang edit */}
          {editingId && (
            <Form.Item label="Quản lý ảnh">
              <ImageManager
                images={(() => {
                  const banner = banners.find(b => b.id === editingId);
                  return banner ? [{ id: banner.id, image: banner.image || banner.image_url, alt_text: banner.alt_text }] : [];
                })()}
                entityId={editingId}
                isEditing={true}
                uploadingImages={uploadingImages}
                onImageUpload={handleImageUpload}
                onDeleteImage={handleDeleteImage}
                onUpdateAltText={handleUpdateImageAltText}
                title="Quản lý ảnh banner"
                entityName="banner"
                imageSize={{ width: 100, height: 75 }}
                popupImageSize={{ width: 200, height: 150 }}
                columnWidth={200}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
                setEditingId(null);
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 