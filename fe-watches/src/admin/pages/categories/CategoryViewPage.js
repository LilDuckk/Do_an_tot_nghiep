import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hasModulePermission } from '@/services/permission';
import { PRODUCT_ENDPOINTS } from '@/config/api';
import '@/admin/static/AdminCommon.css';

export default function CategoryViewPage() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError('Vui lòng đăng nhập lại');
          setLoading(false);
          return;
        }

        const res = await fetch(PRODUCT_ENDPOINTS.CATEGORY_DETAIL(id), {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setCategory(data);
        
        // Fetch parent category if exists
        if (data.parent) {
          const parentRes = await fetch(PRODUCT_ENDPOINTS.CATEGORY_DETAIL(data.parent), {
            method: 'GET',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (!parentRes.ok) {
            throw new Error(`HTTP error! status: ${parentRes.status}`);
          }

          const parentData = await parentRes.json();
          setParentCategory(parentData);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        setError('Không thể tải thông tin danh mục. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (!hasModulePermission('category', 'view')) {
    return <div className="admin-error">Bạn không có quyền xem danh mục.</div>;
  }

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!category) return null;

  return (
    <div className="admin-group-view">
      <h2>Chi tiết danh mục</h2>
      <div><b>ID:</b> {category.id}</div>
      <div><b>Tên danh mục:</b> {category.name}</div>
      <div><b>Mô tả:</b> {category.description}</div>
      <div><b>Danh mục cha:</b> {parentCategory ? parentCategory.name : 'Không có'}</div>
      <div><b>Thứ tự hiển thị:</b> {category.display_order}</div>
      <div><b>Trạng thái:</b> {category.is_active ? 'Hoạt động' : 'Ẩn'}</div>
      <button className="admin-btn" onClick={() => navigate('/admin/categories')}>Quay lại</button>
    </div>
  );
} 