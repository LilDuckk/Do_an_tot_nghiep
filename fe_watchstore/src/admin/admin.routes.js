import { lazy } from 'react';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ProductManage = lazy(() => import('./pages/ProductManage'));
const OrderManage = lazy(() => import('./pages/OrderManage'));

const adminRoutes = [
  {
    path: '/admin/dashboard',
    element: <AdminDashboard />,
  },
  {
    path: '/admin/products',
    element: <ProductManage />,
  },
  {
    path: '/admin/orders',
    element: <OrderManage />,
  },
];

export default adminRoutes; 