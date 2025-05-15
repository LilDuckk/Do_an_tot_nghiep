import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import AdminLogin from './admin/AdminLogin';
import ClientHome from './client/ClientHome';
import Dashboard from './admin/Dashboard';
import AdminLayout from './admin/AdminLayout';
import UsersPage from './admin/users/UsersPage';
import ProductsPage from './admin/products/ProductsPage';
import OrdersPage from './admin/orders/OrdersPage';
import StoresPage from './admin/stores/StoresPage';
import WarrantiesPage from './admin/warranties/WarrantiesPage';
import AuditLogsPage from './admin/audit/AuditLogsPage';
import LogoutPage from './admin/logout/LogoutPage';
import ProfilePage from './admin/profile/ProfilePage';
import GroupsPage from './admin/groups/GroupsPage';
import PermissionsPage from './admin/permissions/PermissionsPage';
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

function PrivateRoute({ children }) {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('access');
  return token ? children : <Navigate to="/admin/login" />;
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
          <Route path="orders" element={<OrdersPage />} />
          <Route path="stores" element={<StoresPage />} />
          <Route path="warranties" element={<WarrantiesPage />} />
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
        </Route>
        <Route path="/" element={<ClientHome />} />
      </Routes>
    </Router>
  );
}

export default App;
