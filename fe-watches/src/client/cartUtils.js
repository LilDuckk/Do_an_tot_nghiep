// Cart utilities for managing cart data in cookies
const CART_COOKIE_NAME = 'vietco_cart';
const USER_INFO_COOKIE_NAME = 'vietco_user_info';

// Helper function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Helper function to set cookie
const setCookie = (name, value, days = 30) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${JSON.stringify(value)};expires=${expires.toUTCString()};path=/`;
};

// Get cart from cookie
export const getCart = () => {
  try {
    const cartData = getCookie(CART_COOKIE_NAME);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error parsing cart cookie:', error);
    return [];
  }
};

// Add item to cart
export const addToCart = (productId, attributes = {}, quantity = 1) => {
  const cart = getCart();
  
  // Check if product with same attributes already exists
  const existingItemIndex = cart.findIndex(item => 
    item.productId === productId && 
    JSON.stringify(item.attributes) === JSON.stringify(attributes)
  );
  
  if (existingItemIndex !== -1) {
    // Update quantity if item exists
    cart[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.push({
      productId,
      attributes,
      quantity,
      addedAt: new Date().toISOString()
    });
  }
  
  setCookie(CART_COOKIE_NAME, cart);
  return cart;
};

// Remove item from cart
export const removeFromCart = (productId, attributes = {}) => {
  const cart = getCart();
  const filteredCart = cart.filter(item => 
    !(item.productId === productId && 
      JSON.stringify(item.attributes) === JSON.stringify(attributes))
  );
  setCookie(CART_COOKIE_NAME, filteredCart);
  return filteredCart;
};

// Update cart item quantity
export const updateCartItem = (productId, attributes = {}, quantity) => {
  const cart = getCart();
  const itemIndex = cart.findIndex(item => 
    item.productId === productId && 
    JSON.stringify(item.attributes) === JSON.stringify(attributes)
  );
  
  if (itemIndex !== -1) {
    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
    }
    setCookie(CART_COOKIE_NAME, cart);
  }
  
  return cart;
};

// Clear entire cart
export const clearCart = () => {
  setCookie(CART_COOKIE_NAME, []);
  return [];
};

// Get cart item count
export const getCartCount = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

// Get user info from cookie
export const getUserInfo = () => {
  try {
    const userData = getCookie(USER_INFO_COOKIE_NAME);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user info cookie:', error);
    return null;
  }
};

// Set user info to cookie
export const setUserInfo = (userInfo) => {
  setCookie(USER_INFO_COOKIE_NAME, userInfo);
};

// Get cart total price (requires product data)
export const getCartTotal = (cartItems) => {
  return cartItems.reduce((total, item) => {
    const itemPrice = item.product?.finalPrice || item.product?.base_price || 0;
    return total + (parseFloat(itemPrice) * item.quantity);
  }, 0);
};

// Format price to Vietnamese currency
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}; 