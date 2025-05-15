import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LogoutPage() {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  }, [navigate]);
  return null;
} 