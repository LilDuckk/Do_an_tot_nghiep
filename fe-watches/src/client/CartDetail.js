import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCT_ENDPOINTS } from '../config/api';
import Header from './Header';
import Footer from './Footer';
import { 
  getCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart, 
  getCartTotal, 
  formatPrice,
  getUserInfo,
  setUserInfo
} from './cartUtils';
import './static/CartDetail.css';

export default function CartDetail() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfoState] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    note: ''
  });
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Load cart items and user info
  useEffect(() => {
    const loadCartData = async () => {
      try {
        setLoading(true);
        const cart = getCart();
        const savedUserInfo = getUserInfo();
        
        if (savedUserInfo) {
          setUserInfoState(savedUserInfo);
        }
        
        if (cart.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        // Fetch product details for all cart items
        const productPromises = cart.map(async (item) => {
          try {
            const response = await fetch(PRODUCT_ENDPOINTS.PRODUCT_DETAIL(item.productId));
            if (!response.ok) throw new Error('Failed to fetch product');
            const productData = await response.json();
            
            // Calculate final price based on variant
            let finalPrice = parseFloat(productData.base_price);
            if (Object.keys(item.attributes).length > 0) {
              // Try to find matching variant
              const variantsResponse = await fetch(PRODUCT_ENDPOINTS.PRODUCT_VARIANTS(item.productId));
              if (variantsResponse.ok) {
                const variants = await variantsResponse.json();
                const matchingVariant = variants.find(variant => 
                  variant.is_active && 
                  variant.attribute_values.every(attrValue => {
                    const attrType = productData.attributes?.find(type => 
                      type.values.some(val => val.id === attrValue)
                    );
                    if (!attrType) return true;
                    return item.attributes[attrType.id] === attrValue;
                  })
                );
                if (matchingVariant && matchingVariant.price_adjustment) {
                  finalPrice += parseFloat(matchingVariant.price_adjustment);
                }
              }
            }

            return {
              ...item,
              product: {
                ...productData,
                finalPrice: finalPrice.toString()
              }
            };
          } catch (error) {
            console.error(`Error fetching product ${item.productId}:`, error);
            return {
              ...item,
              product: null
            };
          }
        });

        const itemsWithProducts = await Promise.all(productPromises);
        setCartItems(itemsWithProducts.filter(item => item.product !== null));
      } catch (error) {
        console.error('Error loading cart data:', error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCartData();
  }, []);

  const handleQuantityChange = (productId, attributes, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId, attributes);
    } else {
      updateCartItem(productId, attributes, newQuantity);
      setCartItems(prev => prev.map(item => 
        item.productId === productId && 
        JSON.stringify(item.attributes) === JSON.stringify(attributes)
          ? { ...item, quantity: newQuantity }
          : item
      ));
      document.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const handleRemoveItem = (productId, attributes) => {
    removeFromCart(productId, attributes);
    setCartItems(prev => prev.filter(item => 
      !(item.productId === productId && 
        JSON.stringify(item.attributes) === JSON.stringify(attributes))
    ));
    document.dispatchEvent(new Event('cartUpdated'));
  };

  const handleUserInfoChange = (field, value) => {
    setUserInfoState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getAttributeDisplay = (attributes, product) => {
    if (!product || !product.attributes || Object.keys(attributes).length === 0) {
      return '';
    }

    const attributeStrings = [];
    Object.entries(attributes).forEach(([typeId, valueId]) => {
      const attrType = product.attributes.find(type => type.id === parseInt(typeId));
      if (attrType) {
        const attrValue = attrType.values.find(val => val.id === parseInt(valueId));
        if (attrValue) {
          attributeStrings.push(`${attrType.name}: ${attrValue.value}`);
        }
      }
    });

    return attributeStrings.join(', ');
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!userInfo.fullName.trim() || !userInfo.phone.trim()) {
      alert('Vui lòng điền đầy đủ họ tên và số điện thoại');
      return;
    }

    // Save user info to cookie
    setUserInfo(userInfo);
    
    // Here you would typically send the order to your backend
    // For now, we'll just show a success message
    setOrderSuccess(true);
    
    // Clear cart after successful order
    clearCart();
    setCartItems([]);
    document.dispatchEvent(new Event('cartUpdated'));
  };

  const totalPrice = getCartTotal(cartItems);

  if (loading) {
    return (
      <div>
        <Header />
        <div className="cart-detail-container">
          <div className="loading">Đang tải giỏ hàng...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div>
        <Header />
        <div className="cart-detail-container">
          <div className="order-success">
            <h2>Đặt hàng thành công!</h2>
            <p>Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
            <Link to="/products" className="continue-shopping-btn">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="cart-detail-container">
        <div className="cart-detail-header">
          <h1>Giỏ hàng</h1>
          {cartItems.length > 0 && (
            <button 
              className="clear-cart-btn"
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
                  clearCart();
                  setCartItems([]);
                  document.dispatchEvent(new Event('cartUpdated'));
                }
              }}
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <h2>Giỏ hàng trống</h2>
            <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
            <Link to="/products" className="continue-shopping-btn">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="cart-detail-content">
            <div className="cart-items-section">
              <h2>Sản phẩm ({cartItems.length})</h2>
              <div className="cart-items">
                {cartItems.map((item, index) => (
                  <div key={`${item.productId}-${JSON.stringify(item.attributes)}-${index}`} className="cart-item">
                    <div className="item-image">
                      <img 
                        src={item.product.images?.[0]?.image_url || 'https://i.imgur.com/1Q9Z1Zm.png'} 
                        alt={item.product.name}
                      />
                    </div>
                    <div className="item-details">
                      <h3 className="item-name">{item.product.name}</h3>
                      {getAttributeDisplay(item.attributes, item.product) && (
                        <p className="item-attributes">{getAttributeDisplay(item.attributes, item.product)}</p>
                      )}
                      <div className="item-price">{formatPrice(item.product.finalPrice)}</div>
                    </div>
                    <div className="item-quantity">
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.productId, item.attributes, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="quantity-display">{item.quantity}</span>
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(item.productId, item.attributes, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="item-total">
                      {formatPrice(item.product.finalPrice * item.quantity)}
                    </div>
                    <button 
                      className="remove-item-btn"
                      onClick={() => handleRemoveItem(item.productId, item.attributes)}
                      title="Xóa sản phẩm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-section">
              <h2>Thông tin đặt hàng</h2>
              <form onSubmit={handleSubmitOrder} className="order-form">
                <div className="form-group">
                  <label htmlFor="fullName">Họ tên *</label>
                  <input
                    type="text"
                    id="fullName"
                    value={userInfo.fullName}
                    onChange={(e) => handleUserInfoChange('fullName', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={userInfo.phone}
                    onChange={(e) => handleUserInfoChange('phone', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={userInfo.email}
                    onChange={(e) => handleUserInfoChange('email', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">Địa chỉ</label>
                  <textarea
                    id="address"
                    value={userInfo.address}
                    onChange={(e) => handleUserInfoChange('address', e.target.value)}
                    rows="3"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="note">Ghi chú</label>
                  <textarea
                    id="note"
                    value={userInfo.note}
                    onChange={(e) => handleUserInfoChange('note', e.target.value)}
                    rows="3"
                    placeholder="Ghi chú thêm về đơn hàng..."
                  />
                </div>

                <div className="order-summary">
                  <div className="summary-item">
                    <span>Tổng tiền hàng:</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="summary-item total">
                    <span>Tổng cộng:</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <button type="submit" className="submit-order-btn">
                  Đặt hàng
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
} 