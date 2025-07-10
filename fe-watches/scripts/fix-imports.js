const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Cấu hình path mapping
const pathMappings = {
  // Admin pages
  './admin/pages/orders/OrdersPage': '@/admin/pages',
  './admin/pages/products/ProductsPage': '@/admin/pages',
  './admin/pages/stores/StoresPage': '@/admin/pages',
  './admin/pages/warranties/WarrantyPage': '@/admin/pages',
  './admin/pages/audit/AuditLogsPage': '@/admin/pages',
  './admin/pages/logout/LogoutPage': '@/admin/pages',
  './admin/pages/profile/ProfilePage': '@/admin/pages',
  './admin/pages/categories/CategoriesPage': '@/admin/pages',
  './admin/pages/brands/BrandsPage': '@/admin/pages',
  './admin/pages/variants/VariantsPage': '@/admin/pages',
  './admin/pages/attributes/AttributesPage': '@/admin/pages',
  './admin/pages/return-orders/ReturnOrdersPage': '@/admin/pages',
  './admin/pages/inventories/InventoriesPage': '@/admin/pages',
  './admin/pages/stock-takes/StockTakesPage': '@/admin/pages',
  './admin/pages/stock-transfers/StockTransfersPage': '@/admin/pages',
  './admin/pages/users/UsersListPage': '@/admin/pages',
  './admin/pages/groups/GroupsListPage': '@/admin/pages',
  './admin/pages/groups/GroupCreatePage': '@/admin/pages',
  './admin/pages/groups/GroupEditPage': '@/admin/pages',
  './admin/pages/groups/GroupViewPage': '@/admin/pages',
  './admin/pages/permissions/PermissionsListPage': '@/admin/pages',
  './admin/pages/products/ProductCreatePage': '@/admin/pages',
  './admin/pages/products/ProductEditPage': '@/admin/pages',
  './admin/pages/products/ProductViewPage': '@/admin/pages',
  './admin/pages/brands/BrandCreatePage': '@/admin/pages',
  './admin/pages/brands/BrandEditPage': '@/admin/pages',
  './admin/pages/brands/BrandViewPage': '@/admin/pages',
  './admin/pages/categories/CategoryCreatePage': '@/admin/pages',
  './admin/pages/categories/CategoryEditPage': '@/admin/pages',
  './admin/pages/categories/CategoryViewPage': '@/admin/pages',
  './admin/pages/system/BannerManagement': '@/admin/pages',
  './admin/pages/system/ContactManagement': '@/admin/pages',
  './admin/pages/system/FooterManagement': '@/admin/pages',
  './admin/pages/system/NewsManagement': '@/admin/pages',
  './admin/pages/coupon/CouponPage': '@/admin/pages',
  './admin/pages/customers/CustomersListPage': '@/admin/pages',
  './admin/pages/employee/EmployeesPage': '@/admin/pages',
  './admin/pages/suppliers/SupplierPage': '@/admin/pages',
  './admin/pages/purchases/PurchaseOrdersPage': '@/admin/pages',
  './admin/pages/purchases/GoodsReceiptsPage': '@/admin/pages',
  './admin/pages/inventory-transactions/InventoryTransactionsPage': '@/admin/pages',

  // Client components
  './client/ClientHome': '@/client',
  './client/ProductList': '@/client',
  './client/ProductDetail': '@/client',
  './client/CartDetail': '@/client',
  './client/Maintenance': '@/client',
  './client/Contact': '@/client',
  './client/Header': '@/client',
  './client/Footer': '@/client',
  './client/HomeHero': '@/client',
  './client/HotWatches': '@/client',
  './client/WatchSuggest': '@/client',
  './client/DropdownMenu': '@/client',
  './client/DropdownCart': '@/client',
  './client/cartUtils': '@/client',

  // Services
  './services/authService': '@/services',
  './services/axiosConfig': '@/services',
  './services/permission': '@/services',
  './services/userInfo': '@/services',

  // Config
  './config/api': '@/config/api',

  // Admin hooks
  '../../hooks/useDebounce': '@/admin/hooks',
  '../hooks/useDebounce': '@/admin/hooks',

  // Admin static
  '../../static/AdminCommon.css': '@/admin/static/AdminCommon.css',
  '../static/AdminCommon.css': '@/admin/static/AdminCommon.css',
  './static/AdminCommon.css': '@/admin/static/AdminCommon.css',
};

// Tên component mapping
const componentMappings = {
  'OrdersPage': 'OrdersPage',
  'ProductsPage': 'ProductsPage',
  'StoresPage': 'StoresPage',
  'WarrantyPage': 'WarrantyPage',
  'AuditLogsPage': 'AuditLogsPage',
  'LogoutPage': 'LogoutPage',
  'ProfilePage': 'ProfilePage',
  'CategoriesPage': 'CategoriesPage',
  'BrandsPage': 'BrandsPage',
  'VariantsPage': 'VariantsPage',
  'AttributesPage': 'AttributesPage',
  'ReturnOrdersPage': 'ReturnOrdersPage',
  'InventoriesPage': 'InventoriesPage',
  'StockTakesPage': 'StockTakesPage',
  'StockTransfersPage': 'StockTransfersPage',
  'UsersListPage': 'UsersListPage',
  'GroupsListPage': 'GroupsListPage',
  'GroupCreatePage': 'GroupCreatePage',
  'GroupEditPage': 'GroupEditPage',
  'GroupViewPage': 'GroupViewPage',
  'PermissionsListPage': 'PermissionsListPage',
  'ProductCreatePage': 'ProductCreatePage',
  'ProductEditPage': 'ProductEditPage',
  'ProductViewPage': 'ProductViewPage',
  'BrandCreatePage': 'BrandCreatePage',
  'BrandEditPage': 'BrandEditPage',
  'BrandViewPage': 'BrandViewPage',
  'CategoryCreatePage': 'CategoryCreatePage',
  'CategoryEditPage': 'CategoryEditPage',
  'CategoryViewPage': 'CategoryViewPage',
  'BannerManagement': 'BannerManagement',
  'ContactManagement': 'ContactManagement',
  'FooterManagement': 'FooterManagement',
  'NewsManagement': 'NewsManagement',
  'CouponListPage': 'CouponListPage',
  'CustomersListPage': 'CustomersListPage',
  'EmployeesPage': 'EmployeesPage',
  'SupplierPage': 'SupplierPage',
  'PurchaseOrdersPage': 'PurchaseOrdersPage',
  'GoodsReceiptsPage': 'GoodsReceiptsPage',
  'InventoryTransactionsPage': 'InventoryTransactionsPage',
  'ClientHome': 'ClientHome',
  'ProductList': 'ProductList',
  'ProductDetail': 'ProductDetail',
  'CartDetail': 'CartDetail',
  'Maintenance': 'Maintenance',
  'Contact': 'Contact',
  'Header': 'Header',
  'Footer': 'Footer',
  'HomeHero': 'HomeHero',
  'HotWatches': 'HotWatches',
  'WatchSuggest': 'WatchSuggest',
  'DropdownMenu': 'DropdownMenu',
  'DropdownCart': 'DropdownCart',
  'cartUtils': 'cartUtils',
  'authService': 'authService',
  'axiosConfig': 'axiosConfig',
  'permission': 'permission',
  'userInfo': 'userInfo',
  'useDebounce': 'useDebounce',
};

// Các pattern cần thay thế (dùng regex tổng quát)
const importReplacements = [
  {
    // services/permission
    regex: /from\s+['"](\.\.\/)+services\/permission['"]/g,
    replacement: "from '@/services/permission'"
  },
  {
    // services/userInfo
    regex: /from\s+['"](\.\.\/)+services\/userInfo['"]/g,
    replacement: "from '@/services/userInfo'"
  },
  {
    // config/api
    regex: /from\s+['"](\.\.\/)+config\/api['"]/g,
    replacement: "from '@/config/api'"
  },
  {
    // config/api.js (nếu có)
    regex: /from\s+['"](\.\.\/)+config\/api\.js['"]/g,
    replacement: "from '@/config/api'"
  }
];

function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    importReplacements.forEach(({ regex, replacement }) => {
      if (regex.test(content)) {
        content = content.replace(regex, replacement);
        modified = true;
        console.log(`✅ Fixed imports in ${filePath}`);
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Starting import fix process (improved)...\n');

  // Tìm tất cả file JavaScript/JSX trong src
  const files = glob.sync('src/**/*.{js,jsx}', {
    ignore: ['src/index.js', 'src/App.js'] // Bỏ qua file đã được sửa thủ công
  });

  let fixedCount = 0;
  let totalFiles = files.length;

  files.forEach(file => {
    if (fixImportsInFile(file)) {
      fixedCount++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`Total files processed: ${totalFiles}`);
  console.log(`Files modified: ${fixedCount}`);
  console.log(`Files unchanged: ${totalFiles - fixedCount}`);

  if (fixedCount > 0) {
    console.log('\n🎉 Import fix completed successfully!');
  } else {
    console.log('\nℹ️  No files needed import fixes.');
  }
}

// Chạy script
if (require.main === module) {
  main();
}

module.exports = { fixImportsInFile, importReplacements }; 