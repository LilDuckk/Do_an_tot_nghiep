const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
  addWebpackAlias({
    '@': path.resolve(__dirname, 'src'),
    '@/admin': path.resolve(__dirname, 'src/admin'),
    '@/admin/pages': path.resolve(__dirname, 'src/admin/pages'),
    '@/admin/components': path.resolve(__dirname, 'src/admin/components'),
    '@/admin/hooks': path.resolve(__dirname, 'src/admin/hooks'),
    '@/admin/static': path.resolve(__dirname, 'src/admin/static'),
    '@/admin/utils': path.resolve(__dirname, 'src/admin/utils'),
    '@/client': path.resolve(__dirname, 'src/client'),
    '@/client/static': path.resolve(__dirname, 'src/client/static'),
    '@/services': path.resolve(__dirname, 'src/services'),
    '@/config': path.resolve(__dirname, 'src/config'),
    '@/components': path.resolve(__dirname, 'src/components'),
    '@/utils': path.resolve(__dirname, 'src/utils'),
    '@/assets': path.resolve(__dirname, 'src/assets'),
    '@/styles': path.resolve(__dirname, 'src/styles'),
  })
); 