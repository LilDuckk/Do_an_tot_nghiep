import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { authService } from '@/services';
import AdminLogin from '@/admin/AdminLogin';
import ClientHome from '@/client/ClientHome';
import Dashboard from '@/admin/pages/dashboard/Dashboard';
import AdminLayout from '@/admin/AdminLayout';
import ProductList from '@/client/ProductList';
import ProductDetail from '@/client/ProductDetail';
import CartDetail from '@/client/CartDetail';
import Maintenance from '@/client/Maintenance';
import Contact from '@/client/Contact';
import News from '@/client/News';
import NewsDetail from '@/client/NewsDetail';

// Import tất cả admin pages từ file index tập trung
import {
  OrdersPage,
  ProductsPage,
  StoresPage,
  WarrantyPage,
  AuditLogsPage,
  LogoutPage,
  ProfilePage,
  CategoriesPage,
  BrandsPage,
  VariantsPage,
  AttributesPage,
  ReturnOrdersPage,
  InventoriesPage,
  StockTakesPage,
  StockTransfersPage,
  UsersListPage,
  GroupsListPage,
  GroupCreatePage,
  GroupEditPage,
  GroupViewPage,
  PermissionsListPage,
  ProductCreatePage,
  ProductEditPage,
  ProductViewPage,


  BannerManagement,
  ContactManagement,
  FooterManagement,
  NewsManagement,
  CouponListPage,
  CustomersListPage,
  EmployeesPage,
  SupplierPage,
  PurchaseOrdersPage,
  GoodsReceiptsPage,
  InventoryTransactionsPage
} from '@/admin/pages';

import { useEffect } from 'react';

function PrivateRoute({ children }) {
  return authService.isTokenValid() ? children : <Navigate to="/admin/login" />;
}

function App() {
  useEffect(() => {
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UsersListPage />} />
          <Route path="groups" element={<GroupsListPage />} />
          <Route path="groups/create" element={<GroupCreatePage />} />
          <Route path="groups/:id" element={<GroupViewPage />} />
          <Route path="groups/:id/edit" element={<GroupEditPage />} />
          <Route path="permissions" element={<PermissionsListPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/create" element={<ProductCreatePage />} />
          <Route path="products/:id" element={<ProductViewPage />} />
          <Route path="products/:id/edit" element={<ProductEditPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="stores" element={<StoresPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="warranties" element={<WarrantyPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="logout" element={<LogoutPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="variants" element={<VariantsPage />} />
          <Route path="attributes" element={<AttributesPage />} />
          <Route path="return-orders" element={<ReturnOrdersPage />} />
          <Route path="inventories" element={<InventoriesPage />} />
          <Route path="stock-takes" element={<StockTakesPage />} />
          <Route path="stock-transfers" element={<StockTransfersPage />} />
          <Route path="system/banners" element={<BannerManagement />} />
          <Route path="system/contact" element={<ContactManagement />} />
          <Route path="system/footer" element={<FooterManagement />} />
          <Route path="system/news" element={<NewsManagement />} />
          <Route path="coupons" element={<CouponListPage />} />
          <Route path="customers" element={<CustomersListPage />} />
          <Route path="suppliers" element={<SupplierPage />} />
          <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="goods-receipts" element={<GoodsReceiptsPage />} />
          <Route path="inventory-transactions" element={<InventoryTransactionsPage />} />
        </Route>
        <Route path="/" element={<ClientHome />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<CartDetail />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
