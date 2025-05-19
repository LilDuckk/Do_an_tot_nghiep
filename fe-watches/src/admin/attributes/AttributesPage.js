import React, { useState, useEffect, useRef } from 'react';
import '../static/AdminCommon.css';
import { useDebounce } from '../hooks/useDebounce';

export default function AttributesPage() {
  // States cho AttributeType
  const [attributeTypes, setAttributeTypes] = useState([]);
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [editingType, setEditingType] = useState({});
  const [newType, setNewType] = useState({
    name: '',
    description: ''
  });

  // States cho AttributeValue
  const [attributeValues, setAttributeValues] = useState([]);
  const [editingValueId, setEditingValueId] = useState(null);
  const [editingValue, setEditingValue] = useState({});
  const [newValue, setNewValue] = useState({
    name: '',
    value: '',
    attribute_type: ''
  });

  // States chung
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTypeTerm, setSearchTypeTerm] = useState('');
  const [searchValueTerm, setSearchValueTerm] = useState('');
  const debouncedTypeSearch = useDebounce(searchTypeTerm, 500);
  const debouncedValueSearch = useDebounce(searchValueTerm, 500);

  useEffect(() => {
    fetchAttributeTypes();
    fetchAttributeValues();
  }, []);

  useEffect(() => {
    fetchAttributeTypes(debouncedTypeSearch);
  }, [debouncedTypeSearch]);

  useEffect(() => {
    fetchAttributeValues(debouncedValueSearch);
  }, [debouncedValueSearch]);

  // Fetch AttributeTypes
  const fetchAttributeTypes = async (search = '') => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        search: search
      });
      const response = await fetch(`http://localhost:8000/api/products/attributestype/?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Lỗi khi lấy danh sách loại thuộc tính');
      const data = await response.json();
      setAttributeTypes(data.results || data);
    } catch (error) {
      setError(error.message);
    }
  };

  // Fetch AttributeValues
  const fetchAttributeValues = async (search = '') => {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        search: search
      });
      const response = await fetch(`http://localhost:8000/api/products/attributesvalue/?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error('Lỗi khi lấy danh sách giá trị thuộc tính');
      const data = await response.json();
      setAttributeValues(data.results || data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý AttributeType
  const handleTypeCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/products/attributestype/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newType),
      });
      if (!response.ok) throw new Error('Lỗi khi tạo loại thuộc tính');
      const result = await response.json();
      setAttributeTypes(prev => [...prev, result]);
      setNewType({ name: '', description: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleTypeEdit = (type) => {
    setEditingTypeId(type.id);
    setEditingType({ ...type });
  };

  const handleTypeUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/products/attributestype/${editingType.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingType),
      });
      if (!response.ok) throw new Error('Lỗi khi cập nhật loại thuộc tính');
      const result = await response.json();
      setAttributeTypes(prev => prev.map(t => t.id === result.id ? result : t));
      setEditingTypeId(null);
      setEditingType({});
    } catch (error) {
      alert(error.message);
    }
  };

  const handleTypeDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa loại thuộc tính này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/products/attributestype/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Lỗi khi xóa loại thuộc tính');
      setAttributeTypes(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  // Xử lý AttributeValue
  const handleValueCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8000/api/products/attributesvalue/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newValue),
      });
      if (!response.ok) throw new Error('Lỗi khi tạo giá trị thuộc tính');
      const result = await response.json();
      setAttributeValues(prev => [...prev, result]);
      setNewValue({ name: '', value: '', attribute_type: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleValueEdit = (value) => {
    setEditingValueId(value.id);
    setEditingValue({ ...value });
  };

  const handleValueUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/products/attributesvalue/${editingValue.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingValue),
      });
      if (!response.ok) throw new Error('Lỗi khi cập nhật giá trị thuộc tính');
      const result = await response.json();
      setAttributeValues(prev => prev.map(v => v.id === result.id ? result : v));
      setEditingValueId(null);
      setEditingValue({});
    } catch (error) {
      alert(error.message);
    }
  };

  const handleValueDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giá trị thuộc tính này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8000/api/products/attributesvalue/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Lỗi khi xóa giá trị thuộc tính');
      setAttributeValues(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-attributes-container">
      <div className="admin-attributes-grid">
        {/* Phần AttributeType */}
        <div className="admin-attributes-section">
          <div className="admin-list-header">
            <h2>Loại thuộc tính</h2>
          </div>
          <div className="admin-search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm loại thuộc tính..."
              value={searchTypeTerm}
              onChange={e => setSearchTypeTerm(e.target.value)}
            />
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {/* Dòng thêm mới */}
                <tr className="new-item-row">
                  <td>+</td>
                  <td>
                    <input
                      type="text"
                      value={newType.name}
                      onChange={e => setNewType({...newType, name: e.target.value})}
                      placeholder="Tên loại"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={newType.description}
                      onChange={e => setNewType({...newType, description: e.target.value})}
                      placeholder="Mô tả"
                    />
                  </td>
                  <td>
                    <button
                      className="admin-btn primary"
                      onClick={handleTypeCreate}
                      disabled={!newType.name}
                    >
                      Thêm mới
                    </button>
                  </td>
                </tr>
                {/* Danh sách loại thuộc tính */}
                {attributeTypes.map(type => (
                  <tr key={type.id}>
                    <td>{type.id}</td>
                    <td>
                      {editingTypeId === type.id ? (
                        <input
                          type="text"
                          value={editingType.name}
                          onChange={e => setEditingType({...editingType, name: e.target.value})}
                          required
                        />
                      ) : type.name}
                    </td>
                    <td>
                      {editingTypeId === type.id ? (
                        <input
                          type="text"
                          value={editingType.description}
                          onChange={e => setEditingType({...editingType, description: e.target.value})}
                        />
                      ) : type.description}
                    </td>
                    <td className="admin-table-actions">
                      {editingTypeId === type.id ? (
                        <>
                          <button className="admin-btn primary" onClick={handleTypeUpdate}>Lưu</button>
                          <button className="admin-btn" onClick={() => { setEditingTypeId(null); setEditingType({}); }}>Hủy</button>
                        </>
                      ) : (
                        <>
                          <button className="admin-btn" onClick={() => handleTypeEdit(type)}>Sửa</button>
                          <button className="admin-btn danger" onClick={() => handleTypeDelete(type.id)}>Xóa</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Phần AttributeValue */}
        <div className="admin-attributes-section">
          <div className="admin-list-header">
            <h2>Giá trị thuộc tính</h2>
          </div>
          <div className="admin-search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm giá trị thuộc tính..."
              value={searchValueTerm}
              onChange={e => setSearchValueTerm(e.target.value)}
            />
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  
                  <th>Giá trị</th>
                  <th>Loại thuộc tính</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {/* Dòng thêm mới */}
                <tr className="new-item-row">
                  <td>+</td>
                  {/* <td>
                    <input
                      type="text"
                      value={newValue.name}
                      onChange={e => setNewValue({...newValue, name: e.target.value})}
                      placeholder="Tên giá trị"
                      required
                    />
                  </td> */}
                  <td>
                    <input
                      type="text"
                      value={newValue.value}
                      onChange={e => setNewValue({...newValue, value: e.target.value})}
                      placeholder="Giá trị"
                      required
                    />
                  </td>
                  <td>
                    <select
                      value={newValue.attribute_type}
                      onChange={e => setNewValue({...newValue, attribute_type: e.target.value})}
                      required
                    >
                      <option value="">Chọn loại</option>
                      {attributeTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="admin-btn primary"
                      onClick={handleValueCreate}
                      disabled={ !newValue.value || !newValue.attribute_type}
                    >
                      Thêm mới
                    </button>
                  </td>
                </tr>
                {/* Danh sách giá trị thuộc tính */}
                {attributeValues.map(value => (
                  <tr key={value.id}>
                    <td>{value.id}</td>
                    {/* <td>
                      {editingValueId === value.id ? (
                        <input
                          type="text"
                          value={editingValue.name}
                          onChange={e => setEditingValue({...editingValue, name: e.target.value})}
                          required
                        />
                      ) : value.name}
                    </td> */}
                    <td>
                      {editingValueId === value.id ? (
                        <input
                          type="text"
                          value={editingValue.value}
                          onChange={e => setEditingValue({...editingValue, value: e.target.value})}
                          required
                        />
                      ) : value.value}
                    </td>
                    <td>
                      {editingValueId === value.id ? (
                        <select
                          value={editingValue.attribute_type}
                          onChange={e => setEditingValue({...editingValue, attribute_type: e.target.value})}
                          required
                        >
                          {attributeTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                          ))}
                        </select>
                      ) : attributeTypes.find(t => t.id === value.attribute_type)?.name}
                    </td>
                    <td className="admin-table-actions">
                      {editingValueId === value.id ? (
                        <>
                          <button className="admin-btn primary" onClick={handleValueUpdate}>Lưu</button>
                          <button className="admin-btn" onClick={() => { setEditingValueId(null); setEditingValue({}); }}>Hủy</button>
                        </>
                      ) : (
                        <>
                          <button className="admin-btn" onClick={() => handleValueEdit(value)}>Sửa</button>
                          <button className="admin-btn danger" onClick={() => handleValueDelete(value.id)}>Xóa</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 