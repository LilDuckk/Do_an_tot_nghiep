// src/services/permission.js

// Các key quyền cơ bản
export const PERMISSION_KEYS = {
  VIEW: 'view',
  EDIT: 'edit',
  DELETE: 'delete',
  CREATE: 'create',
};

export function isSuperUser() {
  return localStorage.getItem('is_superuser') === 'true';
}

export function getUserPermissionCodenames() {
  if (isSuperUser()) return [];
  try {
    return JSON.parse(localStorage.getItem('user_permission_codenames')) || [];
  } catch {
    return [];
  }
}

/**
 * Lấy quyền FE cho từng module (user, group, product, ...)
 * @param {string} module - ví dụ: 'user', 'group', 'product'
 * @returns {object} - { view: true/false, create: true/false, edit: true/false, delete: true/false }
 */
export function getModulePermissions(module) {
  if (isSuperUser()) {
    return { view: true, create: true, edit: true, delete: true };
  }
  const codenames = getUserPermissionCodenames();
  return {
    view: codenames.includes(`view_${module}`),
    create: codenames.includes(`add_${module}`),
    edit: codenames.includes(`change_${module}`),
    delete: codenames.includes(`delete_${module}`),
  };
}

// Hàm kiểm tra nhanh một quyền cho module
export function hasModulePermission(module, action) {
  if (isSuperUser()) return true;
  const perms = getModulePermissions(module);
  return !!perms[action];
}

// Lấy quyền người dùng hiện tại từ localStorage
export function getUserPermissions() {
  if (isSuperUser()) return {};
  try {
    const perms = JSON.parse(localStorage.getItem('user_permissions'));
    return perms || {};
  } catch {
    return {};
  }
}

// Hàm kiểm tra quyền nhanh
export function hasPermission(key) {
  if (isSuperUser()) return true;
  const perms = getUserPermissions();
  return !!perms[key];
}

// Hàm xử lý và lưu quyền FE vào localStorage sau khi đăng nhập
export async function saveUserPermissionsAfterLogin(user) {
  if (user.is_superuser) {
    localStorage.setItem('is_superuser', 'true');
    // Không lưu quyền cho superuser
    return;
  }
  localStorage.setItem('is_superuser', 'false');
  if (user.permissions) {
    localStorage.setItem('user_permission_codenames', JSON.stringify(user.permissions.map(p => p.codename)));
    localStorage.setItem('user_permissions', JSON.stringify(user.permissions));
  } else {
    localStorage.setItem('user_permission_codenames', '[]');
    localStorage.setItem('user_permissions', '[]');
  }
} 