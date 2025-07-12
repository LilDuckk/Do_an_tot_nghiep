import React, { useState, useCallback } from 'react';
import { Input, Button, Empty, Table, Space, Modal, Form, Select, DatePicker, Tabs } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { CONTENT_ENDPOINTS } from '@/config/api';
import { useListData, useCRUD, useAccessControl, useImages } from '@/admin/hooks';
import { AccessDeniedAlert, CustomPagination, ActionButtons, ImageManager } from '@/admin/components';
import '@/admin/static/AdminCommon.css';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

export default function NewsManagement() {
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [activeTab, setActiveTab] = useState('news');

  // Hook tích hợp cho danh sách tin tức
  const {
    data: news,
    isLoading: newsLoading,
    hasAccess: newsHasAccess,
    searchText: newsSearchText,
    setSearchText: setNewsSearchText,
    currentPage: newsCurrentPage,
    setCurrentPage: setNewsCurrentPage,
    totalPages: newsTotalPages,
    total: newsTotal,
    hasNext: newsHasNext,
    hasPrevious: newsHasPrevious,
    fetchData: fetchNews
  } = useListData({
    module: 'content',
    action: 'view',
    apiEndpoint: CONTENT_ENDPOINTS.NEWS,
    pageSize: 20,
    debounceDelay: 500
  });

  // Hook tích hợp cho danh sách danh mục tin tức
  const {
    data: categories,
    isLoading: categoriesLoading,
    hasAccess: categoriesHasAccess,
    searchText: categoriesSearchText,
    setSearchText: setCategoriesSearchText,
    currentPage: categoriesCurrentPage,
    setCurrentPage: setCategoriesCurrentPage,
    totalPages: categoriesTotalPages,
    total: categoriesTotal,
    hasNext: categoriesHasNext,
    hasPrevious: categoriesHasPrevious,
    fetchData: fetchCategories
  } = useListData({
    module: 'content',
    action: 'view',
    apiEndpoint: CONTENT_ENDPOINTS.NEWS_CATEGORIES,
    pageSize: 20,
    debounceDelay: 500
  });

  // CRUD operations cho tin tức
  const { createData: createNews, updateData: updateNews, deleteData: deleteNews } = useCRUD({
    baseUrl: CONTENT_ENDPOINTS.NEWS,
    entityName: 'tin tức',
    canCreate: newsHasAccess,
    canEdit: newsHasAccess,
    canDelete: newsHasAccess
  });

  // CRUD operations cho danh mục tin tức
  const { createData: createCategory, updateData: updateCategory, deleteData: deleteCategory } = useCRUD({
    baseUrl: CONTENT_ENDPOINTS.NEWS_CATEGORIES,
    entityName: 'danh mục tin tức',
    canCreate: categoriesHasAccess,
    canEdit: categoriesHasAccess,
    canDelete: categoriesHasAccess
  });

  // Access control cho các action cụ thể
  const { checkModulePermission } = useAccessControl();

  // Hook xử lý ảnh cho tin tức
  const {
    uploadingImages: newsUploadingImages,
    handleImageUpload: handleNewsImageUpload,
    handleDeleteImage: handleNewsDeleteImage,
    handleUpdateImageAltText: handleNewsUpdateImageAltText
  } = useImages(
    editingId,
    editingId ? `${CONTENT_ENDPOINTS.NEWS}${editingId}/upload_images/` : null,
    editingId ? `${CONTENT_ENDPOINTS.NEWS}${editingId}/delete_image/` : null,
    (imageId) => `${CONTENT_ENDPOINTS.NEWS}${editingId}/images/${imageId}/`,
    fetchNews
  );

  // Xử lý tin tức
  const handleDeleteNews = useCallback(async (record) => {
    const success = await deleteNews(record.id);
    if (success) {
      fetchNews();
    }
  }, [deleteNews, fetchNews]);

  const handleEditNews = useCallback((record) => {
    console.log('Editing news:', record);
    setEditingId(record.id);
    form.setFieldsValue({
      title: record.title,
      slug: record.slug,
      content: record.content,
      summary: record.summary,
      category: record.category,
      featured_image: record.featured_image,
      is_published: record.is_published,
      publish_date: record.publish_date ? dayjs(record.publish_date) : null,
      meta_title: record.meta_title,
      meta_description: record.meta_description
    });
    setModalVisible(true);
  }, [form]);

  const handleAddNews = useCallback(() => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  const handleSubmitNews = useCallback(async (values) => {
    const formattedValues = {
      title: values.title,
      slug: values.slug,
      content: values.content,
      summary: values.summary,
      category: values.category,
      featured_image: values.featured_image,
      is_published: values.is_published,
      publish_date: values.publish_date ? values.publish_date.format('YYYY-MM-DDTHH:mm:ssZ') : null,
      meta_title: values.meta_title,
      meta_description: values.meta_description
    };

    let success = false;
    if (editingId) {
      success = await updateNews(editingId, formattedValues);
    } else {
      success = await createNews(formattedValues);
    }

    if (success) {
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      fetchNews();
    }
  }, [editingId, updateNews, createNews, form, fetchNews]);

  // Xử lý danh mục tin tức
  const handleDeleteCategory = useCallback(async (record) => {
    const success = await deleteCategory(record.id);
    if (success) {
      fetchCategories();
    }
  }, [deleteCategory, fetchCategories]);

  const handleEditCategory = useCallback((record) => {
    console.log('Editing category:', record);
    setEditingCategoryId(record.id);
    categoryForm.setFieldsValue({
      name: record.name,
      slug: record.slug,
      description: record.description,
      display_order: record.display_order,
      is_active: record.is_active
    });
    setCategoryModalVisible(true);
  }, [categoryForm]);

  const handleAddCategory = useCallback(() => {
    setEditingCategoryId(null);
    categoryForm.resetFields();
    setCategoryModalVisible(true);
  }, [categoryForm]);

  const handleSubmitCategory = useCallback(async (values) => {
    const formattedValues = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      display_order: Number(values.display_order),
      is_active: values.is_active
    };

    let success = false;
    if (editingCategoryId) {
      success = await updateCategory(editingCategoryId, formattedValues);
    } else {
      success = await createCategory(formattedValues);
    }

    if (success) {
      setCategoryModalVisible(false);
      categoryForm.resetFields();
      setEditingCategoryId(null);
      fetchCategories();
    }
  }, [editingCategoryId, updateCategory, createCategory, categoryForm, fetchCategories]);

  // Định nghĩa columns cho tin tức
  const newsColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'featured_image',
      key: 'featured_image',
      width: 120,
      render: (imageUrl, record) => (
        <ImageManager
          images={[{ id: record.id, image: record.featured_image, alt_text: record.meta_title }]}
          entityId={record.id}
          isEditing={false}
          uploadingImages={newsUploadingImages}
          onImageUpload={handleNewsImageUpload}
          onDeleteImage={handleNewsDeleteImage}
          onUpdateAltText={handleNewsUpdateImageAltText}
          title="Quản lý ảnh tin tức"
          entityName="tin tức"
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
      width: 250,
      render: (title, record) => (
        <div className="news-title">
          <div style={{ fontWeight: 'bold' }}>{title}</div>
          {record.summary && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {record.summary.substring(0, 100)}...
            </div>
          )}
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            Slug: {record.slug}
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (categoryId, record) => {
        const category = categories?.find(c => c.id === categoryId);
        return (
          <div className="news-category">
            {category ? category.name : 'Chưa phân loại'}
          </div>
        );
      },
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'publish_date',
      key: 'publish_date',
      width: 120,
      render: (date) => (
        <div className="news-date">
          {date ? new Date(date).toLocaleDateString('vi-VN') : 'Chưa đăng'}
        </div>
      ),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'view_count',
      key: 'view_count',
      width: 100,
      render: (count) => (
        <div className="news-views">
          {count || 0}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_published',
      key: 'is_published',
      width: 120,
      render: (isPublished) => (
        <span className={`status-badge ${isPublished ? 'active' : 'inactive'}`}>
          {isPublished ? 'Đã đăng' : 'Bản nháp'}
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
          onView={() => handleEditNews(record)}
          onEdit={() => handleEditNews(record)}
          onDelete={() => handleDeleteNews(record)}
          hasAccess={newsHasAccess}
          showView={false}
          showEdit={checkModulePermission('content', 'edit')}
          showDelete={checkModulePermission('content', 'delete')}
          entityName="tin tức"
        />
      ),
    },
  ];

  // Định nghĩa columns cho danh mục tin tức
  const categoryColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name, record) => (
        <div className="category-name">
          <div style={{ fontWeight: 'bold' }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Slug: {record.slug}
          </div>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      render: (description) => (
        <div className="category-description">
          {description ? (description.length > 100 ? `${description.substring(0, 100)}...` : description) : 'Không có mô tả'}
        </div>
      ),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'display_order',
      key: 'display_order',
      width: 100,
      render: (order) => (
        <div className="category-order">
          {order}
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
          onView={() => handleEditCategory(record)}
          onEdit={() => handleEditCategory(record)}
          onDelete={() => handleDeleteCategory(record)}
          hasAccess={categoriesHasAccess}
          showView={false}
          showEdit={checkModulePermission('content', 'edit')}
          showDelete={checkModulePermission('content', 'delete')}
          entityName="danh mục tin tức"
        />
      ),
    },
  ];

  return (
    <div className="admin-news-management">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Quản lý tin tức" key="news">
          {/* Access Denied Alert cho tin tức */}
          <AccessDeniedAlert 
            hasAccess={newsHasAccess} 
            module="content"
            action="view"
            showUserInfo={false}
          />
          
          <div className="admin-list-header">
            <div className="search-bar">
              <Input
                placeholder="Tìm kiếm tin tức..."
                prefix={<SearchOutlined />}
                value={newsSearchText}
                onChange={(e) => setNewsSearchText(e.target.value)}
                style={{ width: 300 }}
                allowClear
                disabled={!newsHasAccess}
              />
              {checkModulePermission('content', 'create') && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddNews}
                >
                  Thêm tin tức mới
                </Button>
              )}
            </div>
          </div>

          <Table
            columns={newsColumns}
            dataSource={news}
            loading={newsLoading}
            rowKey="id"
            className="news-table"
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

          {/* Pagination cho tin tức */}
          <CustomPagination
            currentPage={newsCurrentPage}
            totalPages={newsTotalPages}
            total={newsTotal}
            onPageChange={setNewsCurrentPage}
            hasAccess={newsHasAccess}
            hasNext={newsHasNext}
            hasPrevious={newsHasPrevious}
          />
        </TabPane>

        <TabPane tab="Quản lý danh mục tin tức" key="categories">
          {/* Access Denied Alert cho danh mục */}
          <AccessDeniedAlert 
            hasAccess={categoriesHasAccess} 
            module="content"
            action="view"
            showUserInfo={false}
          />
          
          <div className="admin-list-header">
            <div className="search-bar">
              <Input
                placeholder="Tìm kiếm danh mục..."
                prefix={<SearchOutlined />}
                value={categoriesSearchText}
                onChange={(e) => setCategoriesSearchText(e.target.value)}
                style={{ width: 300 }}
                allowClear
                disabled={!categoriesHasAccess}
              />
              {checkModulePermission('content', 'create') && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddCategory}
                >
                  Thêm danh mục mới
                </Button>
              )}
            </div>
          </div>

          <Table
            columns={categoryColumns}
            dataSource={categories}
            loading={categoriesLoading}
            rowKey="id"
            className="category-table"
            scroll={{ x: 1000 }}
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

          {/* Pagination cho danh mục */}
          <CustomPagination
            currentPage={categoriesCurrentPage}
            totalPages={categoriesTotalPages}
            total={categoriesTotal}
            onPageChange={setCategoriesCurrentPage}
            hasAccess={categoriesHasAccess}
            hasNext={categoriesHasNext}
            hasPrevious={categoriesHasPrevious}
          />
        </TabPane>
      </Tabs>

      {/* Modal cho thêm/sửa tin tức */}
      <Modal
        title={editingId ? 'Chỉnh sửa tin tức' : 'Thêm tin tức mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitNews}
        >
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề tin tức" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
          >
            <Input placeholder="Nhập slug (ví dụ: tin-tuc-moi)" />
          </Form.Item>

          <Form.Item
            name="summary"
            label="Tóm tắt"
          >
            <TextArea 
              placeholder="Nhập tóm tắt tin tức" 
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea 
              placeholder="Nhập nội dung chi tiết" 
              rows={6}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Danh mục"
          >
            <Select placeholder="Chọn danh mục">
              {categories?.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="featured_image"
            label="Ảnh đại diện"
          >
            <Input placeholder="Nhập URL ảnh đại diện" />
          </Form.Item>

          <Form.Item
            name="publish_date"
            label="Ngày đăng"
          >
            <DatePicker 
              placeholder="Chọn ngày đăng" 
              style={{ width: '100%' }}
              format="DD/MM/YYYY HH:mm"
              showTime
            />
          </Form.Item>

          <Form.Item
            name="is_published"
            label="Trạng thái"
          >
            <Select placeholder="Chọn trạng thái">
              <Option value={true}>Đã đăng</Option>
              <Option value={false}>Bản nháp</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="meta_title"
            label="Meta Title"
          >
            <Input placeholder="Nhập meta title" />
          </Form.Item>

          <Form.Item
            name="meta_description"
            label="Meta Description"
          >
            <TextArea 
              placeholder="Nhập meta description" 
              rows={2}
            />
          </Form.Item>

          {/* Phần quản lý ảnh cho tin tức đang edit */}
          {editingId && (
            <Form.Item label="Quản lý ảnh">
              <ImageManager
                images={(() => {
                  const newsItem = news.find(n => n.id === editingId);
                  return newsItem ? [{ id: newsItem.id, image: newsItem.featured_image, alt_text: newsItem.meta_title }] : [];
                })()}
                entityId={editingId}
                isEditing={true}
                uploadingImages={newsUploadingImages}
                onImageUpload={handleNewsImageUpload}
                onDeleteImage={handleNewsDeleteImage}
                onUpdateAltText={handleNewsUpdateImageAltText}
                title="Quản lý ảnh tin tức"
                entityName="tin tức"
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

      {/* Modal cho thêm/sửa danh mục tin tức */}
      <Modal
        title={editingCategoryId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={categoryModalVisible}
        onCancel={() => {
          setCategoryModalVisible(false);
          categoryForm.resetFields();
          setEditingCategoryId(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleSubmitCategory}
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
          >
            <Input placeholder="Nhập slug (ví dụ: tin-cong-nghe)" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea 
              placeholder="Nhập mô tả danh mục" 
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="display_order"
            label="Thứ tự hiển thị"
            rules={[{ required: true, message: 'Vui lòng nhập thứ tự hiển thị' }]}
          >
            <Input type="number" placeholder="Nhập thứ tự hiển thị" min="1" />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Trạng thái"
          >
            <Select placeholder="Chọn trạng thái">
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Ẩn</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCategoryId ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => {
                setCategoryModalVisible(false);
                categoryForm.resetFields();
                setEditingCategoryId(null);
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