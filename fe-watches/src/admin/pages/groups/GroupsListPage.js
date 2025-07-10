import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Space, Empty } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { useListData, useCRUD } from '@/admin/hooks';
import { AccessDeniedAlert, CustomPagination } from '@/admin/components';
import { AUTH_ENDPOINTS } from '@/config/api';
import '@/admin/static/AdminCommon.css';

export default function GroupsListPage() {
  const navigate = useNavigate();

  // Hook tích hợp cho danh sách groups
  const {
    data: groups,
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
    fetchData: fetchGroups
  } = useListData({
    module: 'group',
    action: 'view',
    apiEndpoint: AUTH_ENDPOINTS.GROUPS,
    pageSize: 20,
    debounceDelay: 500
  });

  // CRUD operations với kiểm tra quyền
  const { deleteData } = useCRUD({
    baseUrl: AUTH_ENDPOINTS.GROUPS,
    entityName: 'nhóm',
    canDelete: hasAccess
  });

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa nhóm này?')) return;
    
    const success = await deleteData(id);
    if (success) {
      fetchGroups();
    }
  }, [deleteData, fetchGroups]);

  return (
    <div className="admin-groups-list">
      {/* Access Denied Alert */}
      <AccessDeniedAlert 
        hasAccess={hasAccess} 
        module="group"
        action="view"
        showUserInfo={true}
      />

      <div className="admin-list-header">
        <h2>Quản lý nhóm</h2>
        <div className="search-bar">
          <Input
            placeholder="Tìm kiếm nhóm..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            disabled={!hasAccess}
          />
          {hasAccess && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/groups/create')}
              disabled={!hasAccess}
            >
              Thêm nhóm
            </Button>
          )}
        </div>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên nhóm</th>
              <th>Mô tả</th>
              <th>Số thành viên</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div>Đang tải...</div>
                </td>
              </tr>
            ) : groups.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Empty description="Không có dữ liệu" imageStyle={{ height: 60 }} />
                </td>
              </tr>
            ) : (
              groups.map(g => (
                <tr key={g.id}>
                  <td>{g.id}</td>
                  <td>{g.name}</td>
                  <td>{g.description}</td>
                  <td>{g.user_count || 0}</td>
                  <td className="admin-table-actions">
                    <button 
                      className="admin-btn" 
                      onClick={() => navigate(`/admin/groups/${g.id}`)} 
                      disabled={!hasAccess}
                    >
                      Xem
                    </button>
                    {hasAccess && (
                      <button 
                        className="admin-btn" 
                        onClick={() => navigate(`/admin/groups/${g.id}/edit`)} 
                        disabled={!hasAccess}
                      >
                        Sửa
                      </button>
                    )}
                    {hasAccess && (
                      <button 
                        className="admin-btn danger" 
                        onClick={() => handleDelete(g.id)} 
                        disabled={!hasAccess}
                      >
                        Xóa
                      </button>
                    )}
                  </td>
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