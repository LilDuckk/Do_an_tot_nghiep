import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra token khi component mount
    console.log('AuthContext - Checking initial token');
    const token = localStorage.getItem('accessToken');
    console.log('AuthContext - Initial token:', token ? 'exists' : 'not found');
    if (token) {
      setUser({ token });
      console.log('AuthContext - User set with token');
    }
    setLoading(false);
    console.log('AuthContext - Initial loading completed');
  }, []);

  const login = async (token) => {
    try {
      console.log('AuthContext - Login attempt with token:', token ? 'provided' : 'missing');
      localStorage.setItem('accessToken', token);
      setUser({ token });
      console.log('AuthContext - Login successful, user state updated');
      return true;
    } catch (error) {
      console.error('AuthContext - Login error:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('AuthContext - Logout called');
    localStorage.removeItem('accessToken');
    setUser(null);
    console.log('AuthContext - User state cleared');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user?.token,
  };

  console.log('AuthContext - Current state:', {
    isAuthenticated: !!user?.token,
    hasUser: !!user,
    isLoading: loading
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 