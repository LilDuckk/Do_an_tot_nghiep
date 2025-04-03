import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider } from './auth/AuthContext';

// Import layouts
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './layouts/AdminLayout';

// Import pages
import HomePage from './home/pages/HomePage';
import ProductDetail from './home/pages/ProductDetail';
import Cart from './home/pages/Cart';
import Login from './auth/pages/Login';
import Register from './auth/pages/Register';
import AdminLogin from './admin/pages/AdminLogin';
import ProductManage from './admin/pages/ProductManage';
import CategoryManage from './admin/pages/CategoryManage';
import UserManage from './admin/pages/UserManage';
import OrderManage from './admin/pages/OrderManage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Client routes */}
            <Route path="/" element={<ClientLayout />}>
              <Route index element={<HomePage />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="products" element={<ProductManage />} />
              <Route path="categories" element={<CategoryManage />} />
              <Route path="users" element={<UserManage />} />
              <Route path="orders" element={<OrderManage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
