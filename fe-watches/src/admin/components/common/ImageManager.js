import React from 'react';
import { Popover, Image, Button, Input, Upload } from 'antd';
import { PictureOutlined, UploadOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '@/config/api';

const ImageManager = ({
  images = [],
  entityId,
  isEditing = false,
  uploadingImages = {},
  onImageUpload,
  onDeleteImage,
  onUpdateAltText,
  title = "Quản lý ảnh",
  entityName = "mục",
  imageSize = { width: 60, height: 60 },
  popupImageSize = { width: 120, height: 120 },
  columnWidth = 120
}) => {
  const firstImage = images[0];
  
  // Nội dung popup hiển thị tất cả ảnh
  const popupContent = (
    <div style={{ maxWidth: 300, maxHeight: 400, overflow: 'auto' }}>
      {images.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          Không có ảnh
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#1890ff' }}>
            Tất cả ảnh của {entityName} ({images.length} ảnh)
          </div>
          {images.map((image, index) => (
            <div key={image.id} style={{ marginBottom: '10px', textAlign: 'center' }}>
              <Image
                src={image.image?.startsWith('http') ? image.image : `${API_BASE_URL}${image.image}`}
                alt={image.alt_text || `Ảnh ${index + 1}`}
                width={popupImageSize.width}
                height={popupImageSize.height}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
              {image.alt_text && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  {image.alt_text}
                </div>
              )}
              {isEditing && (
                <div style={{ marginTop: '5px' }}>
                  <Input
                    placeholder="Mô tả ảnh"
                    value={image.alt_text || ''}
                    onChange={e => onUpdateAltText(image.id, e.target.value)}
                    size="small"
                    style={{ marginBottom: '5px' }}
                  />
                  <Button
                    type="primary"
                    danger
                    size="small"
                    onClick={e => { e.preventDefault(); onDeleteImage(image.id); }}
                    style={{ width: '100%' }}
                  >
                    Xóa
                  </Button>
                </div>
              )}
            </div>
          ))}
          {isEditing && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
              <Upload
                beforeUpload={() => false}
                onChange={({ fileList }) => {
                  if (fileList.length > 0) {
                    onImageUpload(fileList.map(f => f.originFileObj));
                  }
                }}
                multiple
                accept="image/*"
                disabled={uploadingImages[entityId]}
              >
                <Button 
                  icon={<UploadOutlined />} 
                  disabled={uploadingImages[entityId]}
                  size="small"
                  style={{ width: '100%' }}
                >
                  {uploadingImages[entityId] ? 'Đang tải...' : 'Tải ảnh'}
                </Button>
              </Upload>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="image-manager" style={{ width: columnWidth }}>
      {firstImage ? (
        <Popover
          content={popupContent}
          title={title}
          trigger="hover"
          placement="left"
          overlayStyle={{ maxWidth: 350 }}
        >
          <div style={{ cursor: 'pointer', textAlign: 'center' }}>
            <Image
              src={firstImage.image?.startsWith('http') ? firstImage.image : `${API_BASE_URL}${firstImage.image}`}
              alt={firstImage.alt_text || `Ảnh ${entityName}`}
              width={imageSize.width}
              height={imageSize.height}
              style={{ 
                objectFit: 'cover', 
                borderRadius: '4px',
                border: '1px solid #d9d9d9'
              }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
            {images.length > 1 && (
              <div style={{ 
                fontSize: '10px', 
                color: '#1890ff', 
                marginTop: '2px',
                fontWeight: 'bold'
              }}>
                +{images.length - 1} ảnh khác
              </div>
            )}
          </div>
        </Popover>
      ) : (
        <div style={{ textAlign: 'center', color: '#999' }}>
          <PictureOutlined style={{ fontSize: '24px', marginBottom: '4px' }} />
          <div style={{ fontSize: '10px' }}>Không có ảnh</div>
        </div>
      )}
    </div>
  );
};

export default ImageManager; 