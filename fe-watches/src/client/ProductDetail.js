import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { PRODUCT_ENDPOINTS } from '@/config/api';
import Header from './Header';
import Footer from './Footer';
import { addToCart, getUserInfo, setUserInfo } from './cartUtils';
import './static/ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [allImages, setAllImages] = useState([]);
  const [variantImages, setVariantImages] = useState([]);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addToCartMessage, setAddToCartMessage] = useState('');
  const [contactForm, setContactForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    note: ''
  });
  const THUMBNAILS_PER_PAGE = 6;

  // Hàm lấy danh sách thuộc tính của sản phẩm
  const fetchAttributes = useCallback(async () => {
    try {
      const response = await fetch(PRODUCT_ENDPOINTS.PRODUCT_ATTRIBUTES(id));
      if (!response.ok) throw new Error('Lỗi khi tải thuộc tính');
      const data = await response.json();
      setAttributes(data);
    } catch (error) {
      console.error('Lỗi khi tải thuộc tính:', error);
    }
  }, [id]);

  // Hàm lấy danh sách biến thể
  const fetchVariants = useCallback(async () => {
    try {
      const response = await fetch(PRODUCT_ENDPOINTS.PRODUCT_VARIANTS(id));
      if (!response.ok) throw new Error('Lỗi khi tải biến thể');
      const data = await response.json();
      console.log('API variants data:', data);
      // API mới trả về mảng trực tiếp
      setVariants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi khi tải biến thể:', error);
      setVariants([]);
    }
  }, [id]);

  // Hàm lấy ảnh của biến thể
  const fetchVariantImages = useCallback(async () => {
    try {
      const response = await fetch(`${PRODUCT_ENDPOINTS.VARIANT_IMAGES}?product=${id}`);
      if (!response.ok) throw new Error('Lỗi khi tải ảnh biến thể');
      const data = await response.json();
      // Lấy mảng ảnh từ data.results nếu có
      const imagesArray = Array.isArray(data.results) ? data.results : [];
      return imagesArray.map(img => ({
        id: `variant_${img.id}`,
        image: img.image,
        alt_text: img.alt_text || '',
        variant: img.variant,
        is_variant: true
      }));
    } catch (error) {
      console.error('Lỗi khi tải ảnh biến thể:', error);
      return [];
    }
  }, [id]);

  // Hàm kiểm tra xem một attribute value có hợp lệ với các lựa chọn hiện tại không
  const isAttributeValueValid = useCallback((typeId, valueId) => {
    if (!Array.isArray(variants) || variants.length === 0) return true;
    // Tạo tổ hợp selectedAttributes mới nếu chọn giá trị này
    const testSelections = { ...selectedAttributes, [typeId]: valueId };
    // Chỉ disable nếu không có variant nào chứa tổ hợp này
    return variants.some(variant => {
      if (!variant.is_active) return false;
      return Object.entries(testSelections).every(([tid, vid]) =>
        variant.attribute_values.includes(Number(vid))
      );
    });
  }, [selectedAttributes, variants]);

  // Hàm kiểm tra xem một attribute value có được chọn trong variant hiện tại không
  const isAttributeValueSelected = useCallback((typeId, valueId) => {
    return selectedAttributes[typeId] === valueId;
  }, [selectedAttributes]);

  // Hàm xử lý khi người dùng chọn một attribute value
  const handleAttributeSelect = useCallback((typeId, valueId) => {
    if (!Array.isArray(variants)) return;
    
    const newSelectedAttributes = { ...selectedAttributes };
    if (newSelectedAttributes[typeId] === valueId) {
      delete newSelectedAttributes[typeId];
    } else {
      newSelectedAttributes[typeId] = valueId;
    }
    setSelectedAttributes(newSelectedAttributes);
    
    // Tìm variant phù hợp CHÍNH XÁC với các thuộc tính đã chọn
    const matchingVariant = variants.find(variant => {
      if (!variant.is_active) return false;
      // Kiểm tra xem variant có chứa tất cả các thuộc tính đã chọn không
      return Object.entries(newSelectedAttributes).every(([selectedTypeId, selectedValueId]) => {
        return variant.attribute_values.includes(Number(selectedValueId));
      });
    });
    setCurrentVariant(matchingVariant || null);
    
    let variantImageIndex = -1;
    if (matchingVariant) {
      // Tìm ảnh đầu tiên của variant phù hợp
      variantImageIndex = allImages.findIndex(img => 
        img.is_variant && img.variant === matchingVariant.id
      );
      
      if (variantImageIndex !== -1) {
        setCurrentImageIndex(variantImageIndex);
        
        // Đảm bảo thumbnail list cuộn đến đúng vị trí
        const newThumbnailStart = Math.max(0, 
          Math.min(
            variantImageIndex,
            allImages.length - THUMBNAILS_PER_PAGE
          )
        );
        
        if (variantImageIndex < thumbnailStartIndex || 
            variantImageIndex >= thumbnailStartIndex + THUMBNAILS_PER_PAGE) {
          setThumbnailStartIndex(newThumbnailStart);
        }
      }
    } else if (Object.keys(newSelectedAttributes).length === 0) {
      // Nếu không có thuộc tính nào được chọn, quay về ảnh sản phẩm đầu tiên
      const productImageIndex = allImages.findIndex(img => !img.is_variant);
      if (productImageIndex !== -1) {
        setCurrentImageIndex(productImageIndex);
        setThumbnailStartIndex(0);
      }
    }

    console.log('Selected attributes:', newSelectedAttributes);
    console.log('Variants:', variants.map(v => ({id: v.id, attribute_values: v.attribute_values})));
    console.log('Matching variant:', matchingVariant);
    if (matchingVariant && variantImageIndex !== -1) {
      console.log('Chuyển đến ảnh variant:', variantImageIndex, allImages[variantImageIndex]);
    }
  }, [selectedAttributes, variants, allImages, thumbnailStartIndex, THUMBNAILS_PER_PAGE]);
  

  // Hàm xử lý khi click vào thumbnail
  const handleThumbnailClick = useCallback((index) => {
    setCurrentImageIndex(index);
    const image = allImages[index];
    
    if (image && image.is_variant) {
      // Tìm variant tương ứng với ảnh được click
      const variant = variants.find(v => v.id === image.variant);
      if (variant) {
        // Tự động cập nhật selectedAttributes theo variant
        const newAttributes = {};
        variant.attribute_values.forEach(attrValueId => {
          // Tìm attribute type tương ứng với value này
          const attrType = attributes.find(type => 
            type.values.some(val => val.id === attrValueId)
          );
          if (attrType) {
            newAttributes[attrType.id] = attrValueId;
          }
        });
        setSelectedAttributes(newAttributes);

        console.log('Click vào ảnh variant:', image.variant);
        console.log('Variant attribute_values:', variant ? variant.attribute_values : null);
        console.log('Set selectedAttributes:', newAttributes);
      }
    } else {
      console.log('Click vào ảnh sản phẩm, reset selectedAttributes');
      setSelectedAttributes({});
    }
  }, [allImages, variants, attributes]);
  

  const fetchProductDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(PRODUCT_ENDPOINTS.PRODUCT_DETAIL(id));
      if (!response.ok) throw new Error('Lỗi khi tải thông tin sản phẩm');
      const data = await response.json();
      setProduct(data);

      // Tải thêm dữ liệu
      const [attributesData, variantsData, variantImagesData] = await Promise.all([
        fetchAttributes(),
        fetchVariants(),
        fetchVariantImages()
      ]);

      console.log('Variant images loaded:', variantImagesData); // Debug log

      // Đảm bảo dữ liệu là mảng và chuyển đổi cấu trúc ảnh sản phẩm
      const allProductImages = Array.isArray(data.images) ? data.images.map(img => ({
        ...img,
        id: `product_${img.id}`,
        image: img.image_url,
        is_variant: false
      })) : [];
      
      const allVariantImages = Array.isArray(variantImagesData) ? variantImagesData : [];
      
      // Gộp ảnh sản phẩm và ảnh variant
      setVariantImages(allVariantImages);
      const combinedImages = [...allProductImages, ...allVariantImages];
      console.log('Combined images:', combinedImages); // Debug log
      setAllImages(combinedImages);
      
      // Lấy index ảnh chính từ primary_image_index hoặc mặc định là 0
      const primaryImageIndex = data.primary_image_index || 0;
      setCurrentImageIndex(primaryImageIndex);

    } catch (error) {
      console.error('Lỗi khi tải thông tin sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  }, [id, fetchAttributes, fetchVariants, fetchVariantImages]);

  useEffect(() => {
    fetchProductDetail();
    
    // Load saved user info for contact form
    const savedUserInfo = getUserInfo();
    if (savedUserInfo) {
      setContactForm({
        fullName: savedUserInfo.fullName || '',
        phone: savedUserInfo.phone || '',
        email: savedUserInfo.email || '',
        note: ''
      });
    }
  }, [fetchProductDetail]);

  // Hàm điều hướng thumbnail
  const handleThumbnailScroll = (direction) => {
    if (direction === 'prev') {
      setThumbnailStartIndex(Math.max(0, thumbnailStartIndex - 1));
    } else {
      setThumbnailStartIndex(Math.min(
        allImages.length - THUMBNAILS_PER_PAGE,
        thumbnailStartIndex + 1
      ));
    }
  };

  // Hàm điều hướng ảnh chính
  const handlePrevImage = useCallback(() => {
    if (!allImages.length) return;
    const newIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
    setCurrentImageIndex(newIndex);
    
    // Cập nhật thumbnail scroll
    if (newIndex < thumbnailStartIndex) {
      setThumbnailStartIndex(Math.max(0, newIndex));
    }
    
    // Cập nhật selected attributes nếu ảnh mới là variant
    const image = allImages[newIndex];
    if (image && image.is_variant) {
      const variant = variants.find(v => v.id === image.variant);
      if (variant) {
        const newAttributes = {};
        variant.attribute_values.forEach(attrValueId => {
          const attrType = attributes.find(type => 
            type.values.some(val => val.id === attrValueId)
          );
          if (attrType) {
            newAttributes[attrType.id] = attrValueId;
          }
        });
        setSelectedAttributes(newAttributes);
      }
    } else {
      setSelectedAttributes({});
    }
  }, [allImages, currentImageIndex, thumbnailStartIndex, variants, attributes]);

  const handleNextImage = useCallback(() => {
    if (!allImages.length) return;
    const newIndex = (currentImageIndex + 1) % allImages.length;
    setCurrentImageIndex(newIndex);
    
    // Cập nhật thumbnail scroll
    if (newIndex >= thumbnailStartIndex + THUMBNAILS_PER_PAGE) {
      setThumbnailStartIndex(Math.min(
        allImages.length - THUMBNAILS_PER_PAGE,
        newIndex - THUMBNAILS_PER_PAGE + 1
      ));
    }
    
    // Cập nhật selected attributes nếu ảnh mới là variant
    const image = allImages[newIndex];
    if (image && image.is_variant) {
      const variant = variants.find(v => v.id === image.variant);
      if (variant) {
        const newAttributes = {};
        variant.attribute_values.forEach(attrValueId => {
          const attrType = attributes.find(type => 
            type.values.some(val => val.id === attrValueId)
          );
          if (attrType) {
            newAttributes[attrType.id] = attrValueId;
          }
        });
        setSelectedAttributes(newAttributes);
      }
    } else {
      setSelectedAttributes({});
    }
  }, [allImages, currentImageIndex, thumbnailStartIndex, THUMBNAILS_PER_PAGE, variants, attributes]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Kiểm tra xem có thuộc tính bắt buộc nào chưa được chọn không
    const requiredAttributes = attributes.filter(attr => attr.required);
    const missingAttributes = requiredAttributes.filter(attr => 
      !selectedAttributes[attr.id]
    );
    
    if (missingAttributes.length > 0) {
      setAddToCartMessage(`Vui lòng chọn: ${missingAttributes.map(attr => attr.name).join(', ')}`);
      setTimeout(() => setAddToCartMessage(''), 3000);
      return;
    }
    
    // Thêm vào giỏ hàng
    addToCart(product.id, selectedAttributes, quantity);
    
    // Hiển thị thông báo thành công
    setAddToCartMessage('Đã thêm vào giỏ hàng!');
    setTimeout(() => setAddToCartMessage(''), 3000);
    
    // Trigger event để cập nhật số lượng trong header
    document.dispatchEvent(new Event('cartUpdated'));
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleContactFormChange = (field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    
    // Save user info to cookie
    setUserInfo({
      fullName: contactForm.fullName,
      phone: contactForm.phone,
      email: contactForm.email,
      address: ''
    });
    
    // Here you would typically send the contact form to your backend
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.');
    setShowForm(false);
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="loading">Đang tải thông tin sản phẩm...</div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Header />
        <div className="error">Không tìm thấy thông tin sản phẩm</div>
        <Footer />
      </div>
    );
  }

  const currentImage = allImages[currentImageIndex] || { image: 'https://i.imgur.com/1Q9Z1Zm.png' };

  return (
    <div>
      <Header />
      <div className="product-detail-container">
        <div className="product-detail-gallery">
          <div className="main-image">
            <img 
              src={currentImage.image ? currentImage.image : 'https://i.imgur.com/1Q9Z1Zm.png'} 
              alt={currentImage.alt_text || product.name} 
            />
            {allImages.length > 1 && (
              <>
                <button 
                  className="nav-button prev-button"
                  onClick={handlePrevImage}
                  aria-label="Ảnh trước"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button 
                  className="nav-button next-button"
                  onClick={handleNextImage}
                  aria-label="Ảnh sau"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </>
            )}
          </div>
          {allImages.length > 0 && (
            <div className="thumbnail-container">
              {thumbnailStartIndex > 0 && (
                <button 
                  className="thumbnail-nav prev"
                  onClick={() => handleThumbnailScroll('prev')}
                  aria-label="Cuộn trái"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              )}
              <div className="thumbnail-list">
                {allImages.slice(thumbnailStartIndex, thumbnailStartIndex + THUMBNAILS_PER_PAGE).map((image, index) => (
                  <div 
                    key={image.id} 
                    className={`thumbnail ${thumbnailStartIndex + index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => handleThumbnailClick(thumbnailStartIndex + index)}
                  >
                    <img 
                      src={image.image ? image.image : 'https://i.imgur.com/1Q9Z1Zm.png'} 
                      alt={image.alt_text || `${product.name} - Ảnh ${thumbnailStartIndex + index + 1}`} 
                    />
                  </div>
                ))}
              </div>
              {thumbnailStartIndex + THUMBNAILS_PER_PAGE < allImages.length && (
                <button 
                  className="thumbnail-nav next"
                  onClick={() => handleThumbnailScroll('next')}
                  aria-label="Cuộn phải"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Thông tin số lượng ảnh và vị trí hiện tại */}
          {allImages.length > 0 && (
            <div className="image-counter">
              <span className="current-image-info">
                Ảnh {currentImageIndex + 1} / {allImages.length}
              </span>
              {allImages.length > THUMBNAILS_PER_PAGE && (
                <span className="thumbnail-range-info">
                  (Hiển thị {thumbnailStartIndex + 1}-{Math.min(thumbnailStartIndex + THUMBNAILS_PER_PAGE, allImages.length)})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <h2>{product.name}</h2>
          <div className="product-detail-price">
            {(() => {
              let price = product.base_price;
              if (currentVariant && currentVariant.price_adjustment) {
                // Cộng thêm price_adjustment nếu có
                price = (parseFloat(product.base_price) + parseFloat(currentVariant.price_adjustment)).toString();
              }
              return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(price);
            })()}
          </div>
          
          <div className="product-detail-desc">
            {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
          </div>

          {/* Phần thuộc tính sản phẩm */}
          <div className="product-attributes">
            {attributes.map(attrType => (
              <div key={attrType.id} className="attribute-type">
                <h3>{attrType.name}</h3>
                <div className="attribute-values">
                  {attrType.values.map(value => {
                    const isValid = isAttributeValueValid(attrType.id, value.id);
                    const isSelected = isAttributeValueSelected(attrType.id, value.id);
                    return (
                      <button
                        key={value.id}
                        className={`attribute-value-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => isValid && handleAttributeSelect(attrType.id, value.id)}
                        disabled={!isValid}
                      >
                        {value.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <ul className="product-detail-attrs">
            <li>
              <strong>Thương hiệu:</strong> {product.brand_detail.name}
            </li>
            <li>
              <strong>Danh mục:</strong> {product.category_detail.name}
            </li>
            <li>
              <strong>Bảo hành:</strong> {product.warranty_period} tháng
            </li>
            <li>
              <strong>Mã sản phẩm:</strong> {product.id}
            </li>
          </ul>

          <div className="product-actions">
            <div className="quantity-selector">
              <label>Số lượng:</label>
              <div className="quantity-controls">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </button>
            
            <button className="contact-buy-btn" onClick={() => setShowForm(true)}>
              Liên hệ mua
            </button>
            
            {addToCartMessage && (
              <div className={`add-to-cart-message ${addToCartMessage.includes('Vui lòng') ? 'error' : 'success'}`}>
                {addToCartMessage}
              </div>
            )}
          </div>

          {showForm && (
            <form className="contact-buy-form" onSubmit={handleContactSubmit}>
              <h4>Đăng ký mua hàng</h4>
              <input 
                type="text" 
                placeholder="Họ tên" 
                value={contactForm.fullName}
                onChange={(e) => handleContactFormChange('fullName', e.target.value)}
                required 
              />
              <input 
                type="tel" 
                placeholder="Số điện thoại" 
                value={contactForm.phone}
                onChange={(e) => handleContactFormChange('phone', e.target.value)}
                required 
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={contactForm.email}
                onChange={(e) => handleContactFormChange('email', e.target.value)}
              />
              <textarea 
                placeholder="Ghi chú" 
                value={contactForm.note}
                onChange={(e) => handleContactFormChange('note', e.target.value)}
              />
              <button type="submit">Gửi thông tin</button>
              <span className="close-form" onClick={() => setShowForm(false)}>Đóng</span>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
} 