// Utility functions để quản lý thông tin user
export const getUserInfo = () => {
  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const isSuperUser = localStorage.getItem('is_superuser') === 'true';
  const currentEmployeeId = currentUser.employee_id || currentUser.id;
  const currentStoreId = currentUser.store_id || null;
  const info = {
    currentUser,
    isSuperUser,
    currentEmployeeId,
    currentStoreId
  };
  return info;
};

export const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  return user;
};

export const isSuperUser = () => {
  const val = localStorage.getItem('is_superuser') === 'true';
  return val;
};

export const getCurrentEmployeeId = () => {
  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const id = currentUser.employee_id || currentUser.id;
  return id;
};

export const getCurrentStoreId = () => {
  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const id = currentUser.store_id || null;
  return id;
};

// Helper function để debug thông tin user
export const debugUserInfo = () => {
  const userInfo = getUserInfo();
  return userInfo;
}; 