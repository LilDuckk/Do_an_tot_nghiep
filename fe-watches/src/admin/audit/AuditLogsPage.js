import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import '../static/AdminCommon.css';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userMap, setUserMap] = useState({});

  const ITEMS_PER_PAGE = 10;
  const DEBOUNCE_DELAY = 500;

  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY);

  const fetchLogs = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: page,
        page_size: ITEMS_PER_PAGE,
        search: search,
        ordering: '-action_date'
      });

      const response = await fetch(`http://localhost:8000/api/core/audit-logs/?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        setError('Bạn không có quyền xem danh sách này.');
        setLogs([]);
        setTotalPages(1);
        return;
      }

      if (!response.ok) throw new Error('Lỗi khi lấy dữ liệu logs');
      
      const data = await response.json();
      setLogs(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / ITEMS_PER_PAGE));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    const fetchAndMapUsers = async (logs) => {
      const userIds = Array.from(new Set(logs.map(l => l.user_id).filter(Boolean)));
      if (userIds.length === 0) return setUserMap({});
      const token = localStorage.getItem('accessToken');
      const users = {};
      await Promise.all(userIds.map(async (id) => {
        try {
          const res = await fetch(`http://localhost:8000/api/account/users/${id}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            users[id] = data.username;
          }
        } catch {}
      }));
      setUserMap(users);
    };
    if (logs.length > 0) fetchAndMapUsers(logs);
  }, [logs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs(1, searchTerm);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchLogs(1, '');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
        return '#2ecc71';
      case 'UPDATE':
        return '#3498db';
      case 'DELETE':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={currentPage === i ? 'active' : ''}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="admin-pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        <div className="page-numbers">
          {pages}
        </div>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
        <span className="page-info">
          Trang {currentPage} / {totalPages}
        </span>
      </div>
    );
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-users-list">
      <div className="admin-list-header">
        <h2>Lịch sử thao tác</h2>
      </div>

      <form onSubmit={handleSearch} className="admin-search-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
          />
          {searchTerm && (
            <button 
              type="button" 
              className="clear-search" 
              onClick={handleClearSearch}
              title="Xóa tìm kiếm"
            >
              ×
            </button>
          )}
        </div>
        <button type="submit">Tìm kiếm</button>
      </form>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Hành động</th>
              <th>Model</th>
              <th>ID</th>
              <th>Người dùng</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{formatDate(log.action_date)}</td>
                <td>
                  <span
                    style={{
                      backgroundColor: getActionColor(log.action),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}
                  >
                    {log.action}
                  </span>
                </td>
                <td>{log.model_name}</td>
                <td>{log.object_id}</td>
                <td>{log.user_id ? (userMap[log.user_id] || log.user_id) : 'Hệ thống'}</td>
                <td>{log.ip_address || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && renderPagination()}
    </div>
  );
} 