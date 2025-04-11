import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './auth/AuthContext';

// Import layouts
import ClientLayout from './layouts/ClientLayout';
import AdminLayout from './admin/layouts/AdminLayout';

// Import pages
import HomePage from './home/pages/HomePage';
import ProductDetail from './home/pages/ProductDetail';
import Cart from './home/pages/Cart';
import Register from './auth/pages/Register';
import AdminLogin from './admin/pages/AdminLogin';
import ProductManage from './admin/pages/ProductManage';
import CategoryManage from './admin/pages/CategoryManage';
import UserManage from './admin/pages/UserManage';
import OrderManage from './admin/pages/OrderManage';
import AdminDashboard from './admin/pages/AdminDashboard';
import StoreManage from './admin/pages/StoreManage';
import CouponManage from './admin/pages/CouponManage';
import RevenueReport from './admin/pages/RevenueReport';
import ReviewManage from './admin/pages/ReviewManage';
import NewsManage from './admin/pages/NewsManage';
import NotificationManage from './admin/pages/NotificationManage';
import PromotionManage from './admin/pages/PromotionManage';
import SupportManage from './admin/pages/SupportManage';
import SecurityManage from './admin/pages/SecurityManage';
import ProductReport from './admin/pages/reports/ProductReport';
import CustomerReport from './admin/pages/reports/CustomerReport';
import OrderReport from './admin/pages/reports/OrderReport';
import StoreReport from './admin/pages/reports/StoreReport';
import GeneralSettings from './admin/pages/settings/GeneralSettings';
import EmailSettings from './admin/pages/settings/EmailSettings';
import PaymentSettings from './admin/pages/settings/PaymentSettings';
import ShippingSettings from './admin/pages/settings/ShippingSettings';
import SeoSettings from './admin/pages/settings/SeoSettings';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth routes */}
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
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<ProductManage />} />
              <Route path="categories" element={<CategoryManage />} />
              <Route path="users" element={<UserManage />} />
              <Route path="orders" element={<OrderManage />} />
              <Route path="stores" element={<StoreManage />} />
              <Route path="coupons" element={<CouponManage />} />
              
              {/* Marketing routes */}
              <Route path="promotions" element={<PromotionManage />} />
              <Route path="news" element={<NewsManage />} />
              <Route path="reviews" element={<ReviewManage />} />
              
              {/* Report routes */}
              <Route path="reports" element={<Navigate to="/admin/reports/products" replace />} />
              <Route path="reports/products" element={<ProductReport />} />
              <Route path="reports/customers" element={<CustomerReport />} />
              <Route path="reports/orders" element={<OrderReport />} />
              <Route path="reports/stores" element={<StoreReport />} />
              <Route path="reports/revenue" element={<RevenueReport />} />
              
              {/* Settings routes */}
              <Route path="settings" element={<Navigate to="/admin/settings/general" replace />} />
              <Route path="settings/general" element={<GeneralSettings />} />
              <Route path="settings/email" element={<EmailSettings />} />
              <Route path="settings/payment" element={<PaymentSettings />} />
              <Route path="settings/shipping" element={<ShippingSettings />} />
              <Route path="settings/seo" element={<SeoSettings />} />
            </Route>

            {/* Redirect to home page if route not found */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
