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

// Hàm mapping codename sang quyền FE
const permissionMap = {
  view: ['view_user', 'view_group', 'view_permission'],
  create: ['add_user', 'add_group', 'add_permission'],
  edit: ['change_user', 'change_group', 'change_permission'],
  delete: ['delete_user', 'delete_group', 'delete_permission'],
};

// Hàm xử lý và lưu quyền FE vào localStorage sau khi đăng nhập
export async function saveUserPermissionsAfterLogin(user) {
  if (user.is_superuser ) {
    localStorage.setItem('is_superuser', 'true');
    localStorage.setItem('user_permissions', JSON.stringify({
      view: true, edit: true, delete: true, create: true
    }));
    return;
  }
  // Nếu không phải superuser hoặc staff, lấy quyền từ group
  let userPermissionCodenames = [];
  if (user.groups && user.groups.length > 0) {
    const groupId = user.groups[0].id;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:8000/api/account/auth/groups/${groupId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const groupData = await res.json();
        if (groupData.permissions) {
          // Giả sử backend trả về danh sách codename quyền, nếu không thì cần mapping từ id sang codename
          userPermissionCodenames = groupData.permissions;
        }
      }
    } catch (err) {
      console.error('Lỗi khi lấy quyền từ group:', err);
    }
  }
  localStorage.setItem('is_superuser', 'false');
  localStorage.setItem('user_permission_codenames', JSON.stringify(userPermissionCodenames));
  const fePermissions = {};
  Object.keys(permissionMap).forEach(key => {
    fePermissions[key] = userPermissionCodenames.some(cn => permissionMap[key].includes(cn));
  });
  localStorage.setItem('user_permissions', JSON.stringify(fePermissions));
} 