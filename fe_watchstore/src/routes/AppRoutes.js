import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import homeRoutes from '../home/home.routes';
import adminRoutes from '../admin/admin.routes';
import PrivateRoute from './PrivateRoute';
import ClientLayout from '../home/layouts/ClientLayout';
import AdminLayout from '../admin/layouts/AdminLayout';
import Login from '../auth/Login';

const AppRoutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />

        {/* Home routes with ClientLayout */}
        <Route path="/" element={<ClientLayout />}>
          {homeRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>

        {/* Admin routes with AdminLayout */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          {adminRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path.replace('/admin', '')}
              element={route.element}
            />
          ))}
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes; 