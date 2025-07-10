import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useListData } from '@/admin/hooks';
import { AccessDeniedAlert, CustomPagination } from '@/admin/components';
import { AUTH_ENDPOINTS } from '@/config/api';
import '@/admin/static/AdminCommon.css';

export default function PermissionsListPage() {
  const navigate = useNavigate();

  // Hook tích hợp cho danh sách permissions
  const {
    data: permissions,
    isLoading,
    hasAccess,
    searchText,
    setSearchText,
    currentPage,
    setCurrentPage,
    totalPages,
    total,
    hasNext,
    hasPrevious
  } = useListData({
    module: 'permission',
    action: 'view',
    apiEndpoint: AUTH_ENDPOINTS.PERMISSIONS,
    pageSize: 20,
    debounceDelay: 500
  });

  return (
    <div className="admin-permissions-list">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess}
        module="permission"
        action="view"
        message="Bạn không có quyền xem danh sách quyền"
        description="Bạn không có quyền xem danh sách quyền. Vui lòng liên hệ quản trị viên để được cấp quyền."
      />

      {/* Header */}
      <div className="admin-list-header">
        <h2>Quản lý quyền</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm quyền..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            disabled={!hasAccess}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên quyền</th>
              <th>Mã quyền</th>
              <th>Mô tả</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div>Đang tải...</div>
                </td>
              </tr>
            ) : permissions.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Empty description="Không có dữ liệu" imageStyle={{ height: 60 }} />
                </td>
              </tr>
            ) : (
              permissions.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.codename}</td>
                  <td>{p.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  );
}