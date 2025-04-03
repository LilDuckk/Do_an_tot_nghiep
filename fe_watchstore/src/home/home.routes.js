import { lazy } from 'react';

const HomePage = lazy(() => import('./pages/HomePage'));
const Product = lazy(() => import('./pages/Product'));
const Checkout = lazy(() => import('./pages/Checkout'));

const homeRoutes = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/products',
    element: <Product />,
  },
  {
    path: '/checkout',
    element: <Checkout />,
  },
];

export default homeRoutes; 