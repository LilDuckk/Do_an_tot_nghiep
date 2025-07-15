import { useState } from 'react';
import { PRODUCT_ENDPOINTS, CONTENT_ENDPOINTS } from '@/config/api';

// Global state để lưu trữ dữ liệu đã fetch
let globalData = {
  brands: null,
  categories: null,
  footerLinks: null,
  footerCategories: null,
  banners: null
};

let fetchPromises = {
  brands: null,
  categories: null,
  footerLinks: null,
  footerCategories: null,
  banners: null,
  categoriesAndBrands: null
};

export const useSharedData = () => {
  const [data, setData] = useState(globalData);
  const [loading, setLoading] = useState({
    brands: false,
    categories: false,
    footerLinks: false,
    footerCategories: false,
    banners: false
  });
  const [error, setError] = useState({
    brands: null,
    categories: null,
    footerLinks: null,
    footerCategories: null,
    banners: null
  });

  // Fetch categories and brands từ API mới
  const fetchCategoriesAndBrands = async () => {
    if (globalData.brands !== null && globalData.categories !== null) {
      return { brands: globalData.brands, categories: globalData.categories };
    }
    
    if (fetchPromises.categoriesAndBrands) {
      return fetchPromises.categoriesAndBrands;
    }

    setLoading(prev => ({ ...prev, brands: true, categories: true }));
    setError(prev => ({ ...prev, brands: null, categories: null }));

    fetchPromises.categoriesAndBrands = fetch(PRODUCT_ENDPOINTS.CATEGORIES_AND_BRANDS)
      .then(res => res.json())
      .then(data => {
        const brands = Array.isArray(data.brands) ? data.brands : [];
        const categories = Array.isArray(data.categories) ? data.categories : [];
        
        // Xây dựng cây danh mục
        const categoryMap = new Map();
        const rootCategories = [];
        categories.forEach(category => {
          categoryMap.set(category.id, { ...category, children: [] });
        });
        categories.forEach(category => {
          if (category.parent) {
            const parent = categoryMap.get(category.parent);
            if (parent) {
              parent.children.push(categoryMap.get(category.id));
            }
          } else {
            rootCategories.push(categoryMap.get(category.id));
          }
        });
        
        globalData.brands = brands;
        globalData.categories = rootCategories;
        setData(prev => ({ ...prev, brands, categories: rootCategories }));
        setLoading(prev => ({ ...prev, brands: false, categories: false }));
        return { brands, categories: rootCategories };
      })
      .catch(err => {
        console.error('Error fetching categories and brands:', err);
        setError(prev => ({ ...prev, brands: err.message, categories: err.message }));
        setLoading(prev => ({ ...prev, brands: false, categories: false }));
        throw err;
      });

    return fetchPromises.categoriesAndBrands;
  };

  // Fetch brands (sử dụng dữ liệu từ API mới)
  const fetchBrands = async () => {
    if (globalData.brands !== null) {
      return globalData.brands;
    }
    
    const { brands } = await fetchCategoriesAndBrands();
    return brands;
  };

  // Fetch categories (sử dụng dữ liệu từ API mới)
  const fetchCategories = async () => {
    if (globalData.categories !== null) {
      return globalData.categories;
    }
    
    const { categories } = await fetchCategoriesAndBrands();
    return categories;
  };

  // Fetch footer links
  const fetchFooterLinks = async () => {
    if (globalData.footerLinks !== null) {
      return globalData.footerLinks;
    }
    
    if (fetchPromises.footerLinks) {
      return fetchPromises.footerLinks;
    }

    setLoading(prev => ({ ...prev, footerLinks: true }));
    setError(prev => ({ ...prev, footerLinks: null }));

    fetchPromises.footerLinks = fetch(CONTENT_ENDPOINTS.FOOTER_LINKS_ALL)
      .then(res => res.json())
      .then(linkData => {
        const processedLinks = Array.isArray(linkData) 
          ? linkData 
          : (linkData.results || []);
        
        globalData.footerLinks = processedLinks;
        setData(prev => ({ ...prev, footerLinks: processedLinks }));
        setLoading(prev => ({ ...prev, footerLinks: false }));
        return processedLinks;
      })
      .catch(err => {
        console.error('Error fetching footer links:', err);
        setError(prev => ({ ...prev, footerLinks: err.message }));
        setLoading(prev => ({ ...prev, footerLinks: false }));
        throw err;
      });

    return fetchPromises.footerLinks;
  };

  // Fetch footer categories
  const fetchFooterCategories = async () => {
    if (globalData.footerCategories !== null) {
      return globalData.footerCategories;
    }
    
    if (fetchPromises.footerCategories) {
      return fetchPromises.footerCategories;
    }

    setLoading(prev => ({ ...prev, footerCategories: true }));
    setError(prev => ({ ...prev, footerCategories: null }));

    fetchPromises.footerCategories = fetch(CONTENT_ENDPOINTS.FOOTER_CATEGORIES_ALL)
      .then(res => res.json())
      .then(catData => {
        const processedCategories = Array.isArray(catData) 
          ? catData 
          : (catData.results || []);
        
        globalData.footerCategories = processedCategories;
        setData(prev => ({ ...prev, footerCategories: processedCategories }));
        setLoading(prev => ({ ...prev, footerCategories: false }));
        return processedCategories;
      })
      .catch(err => {
        console.error('Error fetching footer categories:', err);
        setError(prev => ({ ...prev, footerCategories: err.message }));
        setLoading(prev => ({ ...prev, footerCategories: false }));
        throw err;
      });

    return fetchPromises.footerCategories;
  };

  // Fetch banners
  const fetchBanners = async () => {
    if (globalData.banners !== null) {
      return globalData.banners;
    }
    
    if (fetchPromises.banners) {
      return fetchPromises.banners;
    }

    setLoading(prev => ({ ...prev, banners: true }));
    setError(prev => ({ ...prev, banners: null }));

    fetchPromises.banners = fetch(CONTENT_ENDPOINTS.BANNERS_ALL)
      .then(res => res.json())
      .then(bannersData => {
        const processedBanners = Array.isArray(bannersData) 
          ? bannersData 
          : (bannersData.results || []);
        
        globalData.banners = processedBanners;
        setData(prev => ({ ...prev, banners: processedBanners }));
        setLoading(prev => ({ ...prev, banners: false }));
        return processedBanners;
      })
      .catch(err => {
        console.error('Error fetching banners:', err);
        setError(prev => ({ ...prev, banners: err.message }));
        setLoading(prev => ({ ...prev, banners: false }));
        throw err;
      });

    return fetchPromises.banners;
  };

  return {
    data,
    loading,
    error,
    fetchBrands,
    fetchCategories,
    fetchCategoriesAndBrands,
    fetchFooterLinks,
    fetchFooterCategories,
    fetchBanners
  };
}; 