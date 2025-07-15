import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCT_ENDPOINTS } from '@/config/api';
import { getCart, removeFromCart, getCartTotal, formatPrice } from './cartUtils';
import './static/DropdownCart.css';

export default function DropdownCart({ onClose, anchorRef }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        anchorRef?.current &&
        !anchorRef.current.contains(event.target)
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, anchorRef]);

  // Fetch cart items with product details
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const cart = getCart();
        
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
        console.error('Error fetching cart items:', error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleRemoveItem = (productId, attributes) => {
    removeFromCart(productId, attributes);
    setCartItems(prev => prev.filter(item => 
      !(item.productId === productId && 
        JSON.stringify(item.attributes) === JSON.stringify(attributes))
    ));
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

  const totalPrice = getCartTotal(cartItems);

  if (loading) {
    return (
      <div className="dropdown-cart" ref={dropdownRef}>
        <div className="dropdown-cart-header">
          <h3>Giỏ hàng</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="dropdown-cart-content">
          <div className="loading">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dropdown-cart" ref={dropdownRef}>
      <div className="dropdown-cart-header">
        <h3>Giỏ hàng ({cartItems.length} sản phẩm)</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="dropdown-cart-content">
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Giỏ hàng trống</p>
            <Link to="/products" className="continue-shopping">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <>
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
                    <h4 className="item-name">{item.product.name}</h4>
                    {getAttributeDisplay(item.attributes, item.product) && (
                      <p className="item-attributes">{getAttributeDisplay(item.attributes, item.product)}</p>
                    )}
                    <div className="item-price-qty">
                      <span className="item-price">{formatPrice(item.product.finalPrice)}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                    </div>
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
            
            <div className="cart-footer">
              <div className="cart-total">
                <span>Tổng cộng:</span>
                <span className="total-price">{formatPrice(totalPrice)}</span>
              </div>
              <div className="cart-actions">
                <Link to="/cart" className="view-cart-btn" onClick={onClose}>
                  Xem giỏ hàng
                </Link>
                <button className="checkout-btn" onClick={onClose}>
                  Đặt hàng
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 