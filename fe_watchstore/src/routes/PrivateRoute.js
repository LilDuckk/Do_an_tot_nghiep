import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute; 