// Utility functions để quản lý thông tin user
export const getUserInfo = () => {
  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const isSuperUser = localStorage.getItem('is_superuser') === 'true';
  const currentEmployeeId = currentUser.employee_id || currentUser.id;
  const currentStoreId = currentUser.store_id || null;
  
  return {
    currentUser,
    isSuperUser,
    currentEmployeeId,
    currentStoreId
  };
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('adminUser') || '{}');
};

export const isSuperUser = () => {
  return localStorage.getItem('is_superuser') === 'true';
};

export const getCurrentEmployeeId = () => {
  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  return currentUser.employee_id || currentUser.id;
};

export const getCurrentStoreId = () => {
  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  return currentUser.store_id || null;
};

// Helper function để debug thông tin user
export const debugUserInfo = () => {
  const userInfo = getUserInfo();
  console.log('Debug User Info:', userInfo);
  return userInfo;
}; 