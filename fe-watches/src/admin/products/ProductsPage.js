import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductsPage.css';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8000/api/products/', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const productData = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || response.data.data || [];

      setProducts(productData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải danh sách sản phẩm');
      setLoading(false);
    }
  };

  // Create a new product
  const createProduct = async (productData) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post('http://localhost:8000/api/products/', productData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      fetchProducts();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Không thể tạo sản phẩm');
    }
  };

  // Update an existing product
  const updateProduct = async (productId, productData) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`http://localhost:8000/api/products/${productId}/`, productData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      fetchProducts();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Không thể cập nhật sản phẩm');
    }
  };

  // Delete a product
  const deleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:8000/api/products/${productId}/`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Không thể xóa sản phẩm');
    }
  };

  // Open modal for creating a new product
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  // Open modal for editing a product
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Confirm delete product
  const handleDeleteProduct = (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      deleteProduct(productId);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Render product modal
  const renderProductModal = () => {
    if (!isModalOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      const formData = {
        name: e.target.name.value,
        description: e.target.description.value,
        brand: parseInt(e.target.brand.value),
        category: parseInt(e.target.category.value),
        sku: e.target.sku.value,
        is_active: e.target.is_active.checked
      };

      if (modalMode === 'create') {
        createProduct(formData);
      } else {
        updateProduct(selectedProduct.id, formData);
      }
    };

    return (
      <div className="modal">
        <div className="modal-content">
          <h3>{modalMode === 'create' ? 'Thêm sản phẩm' : 'Chỉnh sửa sản phẩm'}</h3>
          <form onSubmit={handleSubmit}>
            <input 
              type="text" 
              name="name" 
              placeholder="Tên sản phẩm" 
              defaultValue={selectedProduct?.name || ''} 
              required 
            />
            <textarea 
              name="description" 
              placeholder="Mô tả" 
              defaultValue={selectedProduct?.description || ''} 
            />
            <input 
              type="text" 
              name="brand" 
              placeholder="ID Thương hiệu" 
              defaultValue={selectedProduct?.brand || ''} 
              required 
            />
            <input 
              type="text" 
              name="category" 
              placeholder="ID Danh mục" 
              defaultValue={selectedProduct?.category || ''} 
              required 
            />
            <input 
              type="text" 
              name="sku" 
              placeholder="SKU" 
              defaultValue={selectedProduct?.sku || ''} 
            />
            <label>
              <input 
                type="checkbox" 
                name="is_active" 
                defaultChecked={selectedProduct?.is_active || true} 
              /> 
              Hiển thị
            </label>
            <div className="modal-actions">
              <button type="submit" className="admin-btn primary">
                {modalMode === 'create' ? 'Thêm' : 'Cập nhật'}
              </button>
              <button 
                type="button" 
                className="admin-btn" 
                onClick={() => setIsModalOpen(false)}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render loading state
  if (loading) {
    return <div className="admin-loading">Đang tải...</div>;
  }

  // Render error state
  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  // Ensure products is an array before mapping
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="admin-section">
      <div className="admin-list-header">
        <h2>Quản lý sản phẩm</h2>
        <button 
          className="admin-btn primary" 
          onClick={handleAddProduct}
        >
          Thêm sản phẩm
        </button>
      </div>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên sản phẩm</th>
              <th>Thương hiệu</th>
              <th>Danh mục</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {safeProducts.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.brand}</td>
                <td>{product.category}</td>
                <td>{product.is_active ? 'Hiển thị' : 'Ẩn'}</td>
                <td>
                  <button 
                    className="admin-btn" 
                    onClick={() => handleEditProduct(product)}
                  >
                    Sửa
                  </button>
                  <button 
                    className="admin-btn danger" 
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {renderProductModal()}
    </div>
  );
}
