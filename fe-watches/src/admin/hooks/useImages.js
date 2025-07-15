import { useState, useCallback } from 'react';
import { message } from 'antd';

export const useImages = (entityId, uploadEndpoint, deleteEndpoint, updateEndpoint, onRefresh) => {
  const [uploadingImages, setUploadingImages] = useState({});

  const handleImageUpload = useCallback(async (files) => {
    if (!files.length) return;
    
    setUploadingImages(prev => ({ ...prev, [entityId]: true }));
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) throw new Error('Lỗi khi upload ảnh');
      
      message.success('Upload ảnh thành công');
      onRefresh();
    } catch (error) {
      message.error(error.message);
    } finally {
      setUploadingImages(prev => ({ ...prev, [entityId]: false }));
    }
  }, [entityId, uploadEndpoint, onRefresh]);

  const handleDeleteImage = useCallback(async (imageId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_id: imageId })
      });

      if (!response.ok) throw new Error('Lỗi khi xóa ảnh');
      
      message.success('Xóa ảnh thành công');
      onRefresh();
    } catch (error) {
      message.error(error.message);
    }
  }, [deleteEndpoint, onRefresh]);

  const handleUpdateImageAltText = useCallback(async (imageId, altText) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(updateEndpoint(imageId), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alt_text: altText })
      });

      if (!response.ok) throw new Error('Lỗi khi cập nhật mô tả ảnh');
      
      message.success('Cập nhật mô tả ảnh thành công');
      onRefresh();
    } catch (error) {
      message.error(error.message);
    }
  }, [updateEndpoint, onRefresh]);

  return {
    uploadingImages,
    handleImageUpload,
    handleDeleteImage,
    handleUpdateImageAltText
  };
}; 