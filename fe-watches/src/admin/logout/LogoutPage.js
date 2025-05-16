import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function LogoutPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Xóa tất cả token và thông tin người dùng
    authService.clearTokens();
    localStorage.removeItem('adminUser');
    
    // Chuyển hướng về trang đăng nhập
    navigate('/admin/login');
  }, [navigate]);

  return null;
} 