import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { authService } from './services/authService';
import AdminLogin from './admin/AdminLogin';
import ClientHome from './client/ClientHome';
import Dashboard from './admin/Dashboard';
import AdminLayout from './admin/AdminLayout';
import OrdersPage from './admin/orders/OrdersPage';
import ProductsPage from './admin/products/ProductsPage';
import StoresPage from './admin/stores/StoresPage';
import WarrantiesPage from './admin/warranties/WarrantiesPage';
import AuditLogsPage from './admin/audit/AuditLogsPage';
import LogoutPage from './admin/logout/LogoutPage';
import ProfilePage from './admin/profile/ProfilePage';
import CategoriesPage from './admin/categories/CategoriesPage';
import BrandsPage from './admin/brands/BrandsPage';
import VariantsPage from './admin/variants/VariantsPage';
import AttributesPage from './admin/attributes/AttributesPage';
import ReturnOrdersPage from './admin/return-orders/ReturnOrdersPage';
import InventoriesPage from './admin/inventories/InventoriesPage';
import StockTakesPage from './admin/stock-takes/StockTakesPage';
import StockTransfersPage from './admin/stock-transfers/StockTransfersPage';
import UsersListPage from './admin/users/UsersListPage';
import UserCreatePage from './admin/users/UserCreatePage';
import UserEditPage from './admin/users/UserEditPage';
import UserViewPage from './admin/users/UserViewPage';
import GroupsListPage from './admin/groups/GroupsListPage';
import GroupCreatePage from './admin/groups/GroupCreatePage';
import GroupEditPage from './admin/groups/GroupEditPage';
import GroupViewPage from './admin/groups/GroupViewPage';
import PermissionsListPage from './admin/permissions/PermissionsListPage';
import ProductCreatePage from './admin/products/ProductCreatePage';
import ProductEditPage from './admin/products/ProductEditPage';
import ProductViewPage from './admin/products/ProductViewPage';
import BrandCreatePage from './admin/brands/BrandCreatePage';
import BrandEditPage from './admin/brands/BrandEditPage';
import BrandViewPage from './admin/brands/BrandViewPage';
import CategoryCreatePage from './admin/categories/CategoryCreatePage';
import CategoryEditPage from './admin/categories/CategoryEditPage';
import CategoryViewPage from './admin/categories/CategoryViewPage';
import ProductList from './client/ProductList';
import ProductDetail from './client/ProductDetail';
import Maintenance from './client/Maintenance';
import Contact from './client/Contact';
import BannerManagement from './admin/system/BannerManagement';
import ContactManagement from './admin/system/ContactManagement';
import FooterManagement from './admin/system/FooterManagement';
import NewsManagement from './admin/system/NewsManagement';
import CouponListPage from './admin/coupon/CouponListPage';
import CustomersListPage from './admin/customers/CustomersListPage';

function PrivateRoute({ children }) {
  return authService.isTokenValid() ? children : <Navigate to="/admin/login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UsersListPage />} />
          <Route path="users/create" element={<UserCreatePage />} />
          <Route path="users/:id" element={<UserViewPage />} />
          <Route path="users/:id/edit" element={<UserEditPage />} />
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
          <Route path="warranties" element={<WarrantiesPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="logout" element={<LogoutPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/create" element={<CategoryCreatePage />} />
          <Route path="categories/:id" element={<CategoryViewPage />} />
          <Route path="categories/:id/edit" element={<CategoryEditPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="brands/create" element={<BrandCreatePage />} />
          <Route path="brands/:id" element={<BrandViewPage />} />
          <Route path="brands/:id/edit" element={<BrandEditPage />} />
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
        </Route>
        <Route path="/" element={<ClientHome />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;
