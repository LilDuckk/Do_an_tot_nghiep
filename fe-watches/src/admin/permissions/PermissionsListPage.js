import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import { Input, Space, Empty, Alert, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useDebounce } from '../hooks/useDebounce';
import { AUTH_ENDPOINTS } from '../../config/api';
import '../static/AdminCommon.css';

export default function PermissionsListPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [accessErrorMsg, setAccessErrorMsg] = useState('');
  const accessErrorShown = useRef(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const debouncedSearchText = useDebounce(searchText);
  const ITEMS_PER_PAGE = 20;

  const showAccessError = useCallback((msg) => {
    if (!accessErrorShown.current) {
      setHasAccess(false);
      setAccessErrorMsg(msg);
      message.error(msg);
      accessErrorShown.current = true;
    }
  }, []);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: currentPage,
        page_size: ITEMS_PER_PAGE,
        search: debouncedSearchText
      });
      const res = await fetch(`${AUTH_ENDPOINTS.PERMISSIONS}/?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403) {
        showAccessError('Bạn không có quyền xem danh sách này.');
        setPermissions([]);
        setTotalPages(1);
        return;
      }
      if (!res.ok) {
        setPermissions([]);
        setTotalPages(1);
        return;
      }
      const data = await res.json();
      const count = data.count || 0;
      const results = data.results || [];
      setPermissions(results);
      if (count === 0) {
        setTotalPages(1);
        if (currentPage !== 1) setCurrentPage(1);
      } else {
        setTotalPages(Math.ceil(count / ITEMS_PER_PAGE));
      }
    } catch (err) {
      setPermissions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchText, showAccessError]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPermissions();
  };

  const renderPagination = () => {
    if (!permissions.length) {
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
    <div className="admin-permissions-list">
      {!hasAccess && (
        <Alert
          message={accessErrorMsg || "Không có quyền truy cập"}
          description="Bạn không có quyền xem hoặc thực hiện các thao tác trên trang này. Vui lòng liên hệ quản trị viên để được cấp quyền."
          type="error"
          showIcon
          style={{ marginBottom: 16, fontSize: 16, fontWeight: 500, padding: 16 }}
        />
      )}
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
            {permissions.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Empty description="No data" imageStyle={{ height: 60 }} />
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
      {renderPagination()}
    </div>
  );
}