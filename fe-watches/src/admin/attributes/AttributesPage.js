import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasModulePermission } from '../../services/permission';
import { useDebounce } from '../hooks/useDebounce';
import { Input, Button, Space, Empty } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import '../static/AdminCommon.css';

export default function AttributesPage() {
  const [attributeTypes, setAttributeTypes] = useState([]);
  const [attributeValues, setAttributeValues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search states for types
  const [typeSearchText, setTypeSearchText] = useState('');
  const [debouncedTypeSearchText, setDebouncedTypeSearchText] = useState('');
  
  // Search states for values
  const [valueSearchText, setValueSearchText] = useState('');
  const [debouncedValueSearchText, setDebouncedValueSearchText] = useState('');
  
  // Pagination states for types
  const [typeCurrentPage, setTypeCurrentPage] = useState(1);
  const [typeTotalPages, setTypeTotalPages] = useState(1);
  
  // Pagination states for values
  const [valueCurrentPage, setValueCurrentPage] = useState(1);
  const [valueTotalPages, setValueTotalPages] = useState(1);
  
  // States for inline editing
  const [editingType, setEditingType] = useState(null);
  const [editingValue, setEditingValue] = useState(null);
  const [newType, setNewType] = useState({ name: '', description: '', display_order: 0, is_active: true });
  const [newValue, setNewValue] = useState({ value: '', attribute_type: '' });
  const [showNewTypeForm, setShowNewTypeForm] = useState(false);
  const [showNewValueForm, setShowNewValueForm] = useState(false);
  
  const navigate = useNavigate();
  const ITEMS_PER_PAGE = 20;

  // Debounce search text for types
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTypeSearchText(typeSearchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [typeSearchText]);

  useEffect(() => {
    setTypeCurrentPage(1);
  }, [debouncedTypeSearchText]);

  useEffect(() => {
    fetchAttributeTypes();
  }, [typeCurrentPage, debouncedTypeSearchText]);

  // Debounce search text for values
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValueSearchText(valueSearchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [valueSearchText]);

  const fetchAttributeTypes = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: typeCurrentPage,
        page_size: ITEMS_PER_PAGE,
        search: debouncedTypeSearchText,
        timestamp: new Date().getTime()
      });
      const res = await fetch(`http://localhost:8000/api/products/attribute-types/?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 403) {
        setError('Bạn không có quyền xem danh sách này.');
        setAttributeTypes([]);
        setTypeTotalPages(1);
        return;
      }
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách loại thuộc tính');
      const data = await res.json();
      setAttributeTypes(data.results || data);
      setTypeTotalPages(Math.ceil((data.count || data.length) / ITEMS_PER_PAGE));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [typeCurrentPage, debouncedTypeSearchText]);

  const fetchAttributeValues = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        page: valueCurrentPage,
        page_size: ITEMS_PER_PAGE,
        search: debouncedValueSearchText,
        timestamp: new Date().getTime()
      });
      const res = await fetch(`http://localhost:8000/api/products/attribute-values/?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Lỗi khi lấy danh sách giá trị thuộc tính');
      const data = await res.json();
      
      // Lấy thông tin attribute_type cho mỗi value
      const valuesWithTypes = await Promise.all(
        (data.results || data).map(async (value) => {
          try {
            const typeRes = await fetch(`http://localhost:8000/api/products/attribute-types/${value.attribute_type}/`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (typeRes.ok) {
              const typeData = await typeRes.json();
              return {
                ...value,
                attribute_type_detail: typeData
              };
            }
            return value;
          } catch (err) {
            console.error('Lỗi khi lấy thông tin loại thuộc tính:', err);
            return value;
          }
        })
      );
      
      setAttributeValues(valuesWithTypes);
      setValueTotalPages(Math.ceil((data.count || data.length) / ITEMS_PER_PAGE));
    } catch (err) {
      console.error(err.message);
    }
  }, [valueCurrentPage, debouncedValueSearchText]);

  useEffect(() => {
    fetchAttributeTypes();
    fetchAttributeValues();
  }, [fetchAttributeTypes, fetchAttributeValues]);

  // const handleTypeSearch = (e) => {
  //   e.preventDefault();
  //   setTypeCurrentPage(1);
  //   fetchAttributeTypes();
  // };

  // const handleValueSearch = (e) => {
  //   e.preventDefault();
  //   setValueCurrentPage(1);
  //   fetchAttributeValues();
  // };

  const handleDeleteType = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa loại thuộc tính này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8000/api/products/attribute-types/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        alert('Bạn không có quyền xóa mục này.');
        return;
      }
      if (res.status === 204) {
        setAttributeTypes(prevTypes => {
          const updatedTypes = prevTypes.filter(type => type.id !== id);
          if (updatedTypes.length === 0 && typeCurrentPage > 1) {
            setTypeCurrentPage(prev => prev - 1);
          }
          return updatedTypes;
        });
        fetchAttributeTypes();
        fetchAttributeValues();
      }
      else throw new Error('Xóa thất bại');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteValue = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa giá trị thuộc tính này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8000/api/products/attribute-values/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        alert('Bạn không có quyền xóa mục này.');
        return;
      }
      if (res.status === 204) {
        setAttributeValues(prevValues => {
          const updatedValues = prevValues.filter(value => value.id !== id);
          if (updatedValues.length === 0 && valueCurrentPage > 1) {
            setValueCurrentPage(prev => prev - 1);
          }
          return updatedValues;
        });
        fetchAttributeTypes();
        fetchAttributeValues();
      }
      else throw new Error('Xóa thất bại');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateType = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:8000/api/products/attribute-types/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newType)
      });
      if (!res.ok) throw new Error('Lỗi khi tạo loại thuộc tính');
      setShowNewTypeForm(false);
      setNewType({ name: '', description: '', display_order: 0, is_active: true });
      setTypeCurrentPage(1);
      fetchAttributeTypes();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateValue = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:8000/api/products/attribute-values/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newValue)
      });
      if (!res.ok) throw new Error('Lỗi khi tạo giá trị thuộc tính');
      setShowNewValueForm(false);
      setNewValue({ value: '', attribute_type: '' });
      setValueCurrentPage(1);
      fetchAttributeValues();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateType = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const typeToUpdate = attributeTypes.find(t => t.id === id);
      const res = await fetch(`http://localhost:8000/api/products/attribute-types/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(typeToUpdate)
      });
      if (!res.ok) throw new Error('Lỗi khi cập nhật loại thuộc tính');
      setEditingType(null);
      fetchAttributeTypes();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateValue = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const valueToUpdate = attributeValues.find(v => v.id === id);
      const res = await fetch(`http://localhost:8000/api/products/attribute-values/${id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...valueToUpdate,
          attribute_type: valueToUpdate.attribute_type
        })
      });
      if (!res.ok) throw new Error('Lỗi khi cập nhật giá trị thuộc tính');
      setEditingValue(null);
      fetchAttributeValues();
    } catch (err) {
      alert(err.message);
    }
  };

  const renderTypePagination = () => {
    const pages = [];
    for (let i = 1; i <= typeTotalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setTypeCurrentPage(i)}
          className={typeCurrentPage === i ? 'active' : ''}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="admin-pagination">
        <button onClick={() => setTypeCurrentPage(prev => Math.max(prev - 1, 1))} disabled={typeCurrentPage === 1}>Trước</button>
        <div className="page-numbers">{pages}</div>
        <button onClick={() => setTypeCurrentPage(prev => Math.min(prev + 1, typeTotalPages))} disabled={typeCurrentPage === typeTotalPages}>Sau</button>
        <span className="page-info">Trang {typeCurrentPage} / {typeTotalPages}</span>
      </div>
    );
  };

  const renderValuePagination = () => {
    const pages = [];
    for (let i = 1; i <= valueTotalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setValueCurrentPage(i)}
          className={valueCurrentPage === i ? 'active' : ''}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="admin-pagination">
        <button onClick={() => setValueCurrentPage(prev => Math.max(prev - 1, 1))} disabled={valueCurrentPage === 1}>Trước</button>
        <div className="page-numbers">{pages}</div>
        <button onClick={() => setValueCurrentPage(prev => Math.min(prev + 1, valueTotalPages))} disabled={valueCurrentPage === valueTotalPages}>Sau</button>
        <span className="page-info">Trang {valueCurrentPage} / {valueTotalPages}</span>
      </div>
    );
  };

  if (loading && !attributeTypes.length) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-attributes-list">
      <div className="admin-list-header">
        <h2>Quản lý thuộc tính</h2>
      </div>

      <div className="admin-tables-container">
        <div className="admin-table-section">
          <h3>Loại thuộc tính</h3>
          <div className="search-bar">
          <Input
            placeholder="Tìm kiếm loại thuộc tính..."
            prefix={<SearchOutlined />}
            value={typeSearchText}
            onChange={(e) => setTypeSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          {hasModulePermission('attribute', 'create') && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowNewTypeForm(true)}
            >
              Thêm loại thuộc tính
            </Button>
          )}
        </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên loại</th>
                  <th>Mô tả</th>
                  <th>Thứ tự</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {showNewTypeForm && (
                  <tr className="editing-row">
                    <td>New</td>
                    <td>
                      <input
                        type="text"
                        value={newType.name}
                        onChange={e => setNewType({ ...newType, name: e.target.value })}
                        placeholder="Tên loại"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={newType.description}
                        onChange={e => setNewType({ ...newType, description: e.target.value })}
                        placeholder="Mô tả"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={newType.display_order}
                        onChange={e => setNewType({ ...newType, display_order: parseInt(e.target.value) || 0 })}
                      />
                    </td>
                    <td>
                      <select
                        value={newType.is_active}
                        onChange={e => setNewType({ ...newType, is_active: e.target.value === 'true' })}
                      >
                        <option value={true}>Hoạt động</option>
                        <option value={false}>Ẩn</option>
                      </select>
                    </td>
                    <td className="admin-table-actions">
                      <button className="admin-btn primary" onClick={handleCreateType}>Lưu</button>
                      <button className="admin-btn" onClick={() => setShowNewTypeForm(false)}>Hủy</button>
                    </td>
                  </tr>
                )}
                {attributeTypes.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Empty description="No data" imageStyle={{ height: 60 }} />
                    </td>
                  </tr>
                ) : (
                  attributeTypes.map(type => (
                    <tr key={type.id}>
                      <td>{type.id}</td>
                      <td>
                        {editingType === type.id ? (
                          <input
                            type="text"
                            value={type.name}
                            onChange={(e) => {
                              const updatedTypes = attributeTypes.map(t =>
                                t.id === type.id ? { ...t, name: e.target.value } : t
                              );
                              setAttributeTypes(updatedTypes);
                            }}
                          />
                        ) : (
                          type.name
                        )}
                      </td>
                      <td>
                        {editingType === type.id ? (
                          <input
                            type="text"
                            value={type.description}
                            onChange={(e) => {
                              const updatedTypes = attributeTypes.map(t =>
                                t.id === type.id ? { ...t, description: e.target.value } : t
                              );
                              setAttributeTypes(updatedTypes);
                            }}
                          />
                        ) : (
                          type.description
                        )}
                      </td>
                      <td>
                        {editingType === type.id ? (
                          <input
                            type="number"
                            value={type.display_order}
                            onChange={(e) => {
                              const updatedTypes = attributeTypes.map(t =>
                                t.id === type.id ? { ...t, display_order: parseInt(e.target.value) } : t
                              );
                              setAttributeTypes(updatedTypes);
                            }}
                          />
                        ) : (
                          type.display_order
                        )}
                      </td>
                      <td>
                        {editingType === type.id ? (
                          <select
                            value={type.is_active}
                            onChange={(e) => {
                              const updatedTypes = attributeTypes.map(t =>
                                t.id === type.id ? { ...t, is_active: e.target.value === 'true' } : t
                              );
                              setAttributeTypes(updatedTypes);
                            }}
                          >
                            <option value={true}>Hoạt động</option>
                            <option value={false}>Ẩn</option>
                          </select>
                        ) : (
                          type.is_active ? 'Hoạt động' : 'Ẩn'
                        )}
                      </td>
                      <td className="admin-table-actions">
                        {editingType === type.id ? (
                          <>
                            <button className="admin-btn primary" onClick={() => handleUpdateType(type.id)}>Lưu</button>
                            <button className="admin-btn" onClick={() => setEditingType(null)}>Hủy</button>
                          </>
                        ) : (
                          <>
                            {hasModulePermission('attribute', 'edit') && (
                              <button className="admin-btn" onClick={() => setEditingType(type.id)}>Sửa</button>
                            )}
                            {hasModulePermission('attribute', 'delete') && (
                              <button className="admin-btn danger" onClick={() => handleDeleteType(type.id)}>Xóa</button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {renderTypePagination()}
        </div>

        <div className="admin-table-section">
          <h3>Giá trị thuộc tính</h3>
            <div className="search-bar">
              <Input
                placeholder="Tìm kiếm giá trị thuộc tính..."
                prefix={<SearchOutlined />}
                value={valueSearchText}
                onChange={(e) => setValueSearchText(e.target.value)}
                style={{ width: 300 }}
                allowClear
              />
              {hasModulePermission('attribute', 'create') && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setShowNewValueForm(true)}
                >
                  Thêm giá trị thuộc tính
                </Button>
              )}
            </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Giá trị</th>
                  <th>Loại thuộc tính</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {showNewValueForm && (
                  <tr className="editing-row">
                    <td>New</td>
                    <td>
                      <input
                        type="text"
                        value={newValue.value}
                        onChange={e => setNewValue({ ...newValue, value: e.target.value })}
                        placeholder="Giá trị"
                      />
                    </td>
                    <td>
                      <select
                        value={newValue.attribute_type}
                        onChange={e => setNewValue({ ...newValue, attribute_type: e.target.value })}
                      >
                        <option value="">Chọn loại thuộc tính</option>
                        {attributeTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="admin-table-actions">
                      <button className="admin-btn primary" onClick={handleCreateValue}>Lưu</button>
                      <button className="admin-btn" onClick={() => setShowNewValueForm(false)}>Hủy</button>
                    </td>
                  </tr>
                )}
                {attributeValues.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Empty description="No data" imageStyle={{ height: 60 }} />
                    </td>
                  </tr>
                ) : (
                  attributeValues.map(value => (
                    <tr key={value.id}>
                      <td>{value.id}</td>
                      <td>
                        {editingValue === value.id ? (
                          <input
                            type="text"
                            value={value.value}
                            onChange={(e) => {
                              const updatedValues = attributeValues.map(v =>
                                v.id === value.id ? { ...v, value: e.target.value } : v
                              );
                              setAttributeValues(updatedValues);
                            }}
                          />
                        ) : (
                          value.value
                        )}
                      </td>
                      <td>
                        {editingValue === value.id ? (
                          <select
                            value={value.attribute_type}
                            onChange={(e) => {
                              const updatedValues = attributeValues.map(v =>
                                v.id === value.id ? { ...v, attribute_type: e.target.value } : v
                              );
                              setAttributeValues(updatedValues);
                            }}
                          >
                            {attributeTypes.map(type => (
                              <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                          </select>
                        ) : (
                          value.attribute_type_detail ? value.attribute_type_detail.name : 'N/A'
                        )}
                      </td>
                      <td className="admin-table-actions">
                        {editingValue === value.id ? (
                          <>
                            <button className="admin-btn primary" onClick={() => handleUpdateValue(value.id)}>Lưu</button>
                            <button className="admin-btn" onClick={() => setEditingValue(null)}>Hủy</button>
                          </>
                        ) : (
                          <>
                            {hasModulePermission('attribute', 'edit') && (
                              <button className="admin-btn" onClick={() => setEditingValue(value.id)}>Sửa</button>
                            )}
                            {hasModulePermission('attribute', 'delete') && (
                              <button className="admin-btn danger" onClick={() => handleDeleteValue(value.id)}>Xóa</button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {renderValuePagination()}
        </div>
      </div>
    </div>
  );
} 