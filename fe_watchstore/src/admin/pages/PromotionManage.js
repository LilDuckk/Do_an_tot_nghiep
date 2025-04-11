import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { vi } from 'date-fns/locale';

const PromotionManage = () => {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PERCENTAGE',
    value: 0,
    minPurchaseAmount: 0,
    maxDiscountAmount: 0,
    startDate: new Date(),
    endDate: new Date(),
    usageLimit: 0,
    isActive: true,
    applicableProducts: [],
    applicableCategories: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchPromotions = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/promotions', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      setPromotions(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/products', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/categories', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
    fetchProducts();
    fetchCategories();
  }, [fetchPromotions, fetchProducts, fetchCategories]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (promotion = null) => {
    if (promotion) {
      setSelectedPromotion(promotion);
      setFormData({
        name: promotion.name,
        description: promotion.description,
        type: promotion.type,
        value: promotion.value,
        minPurchaseAmount: promotion.minPurchaseAmount,
        maxDiscountAmount: promotion.maxDiscountAmount,
        startDate: new Date(promotion.startDate),
        endDate: new Date(promotion.endDate),
        usageLimit: promotion.usageLimit,
        isActive: promotion.isActive,
        applicableProducts: promotion.applicableProducts || [],
        applicableCategories: promotion.applicableCategories || [],
      });
    } else {
      setSelectedPromotion(null);
      setFormData({
        name: '',
        description: '',
        type: 'PERCENTAGE',
        value: 0,
        minPurchaseAmount: 0,
        maxDiscountAmount: 0,
        startDate: new Date(),
        endDate: new Date(),
        usageLimit: 0,
        isActive: true,
        applicableProducts: [],
        applicableCategories: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPromotion(null);
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: e.target.type === 'checkbox' ? checked : value,
    });
  };

  const handleDateChange = (date, field) => {
    setFormData({
      ...formData,
      [field]: date,
    });
  };

  const handleProductChange = (event, newValue) => {
    setFormData({
      ...formData,
      applicableProducts: newValue,
    });
  };

  const handleCategoryChange = (event, newValue) => {
    setFormData({
      ...formData,
      applicableCategories: newValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedPromotion
        ? `http://localhost:8080/api/admin/promotions/${selectedPromotion.id}`
        : 'http://localhost:8080/api/admin/promotions';
      const method = selectedPromotion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchPromotions();
        handleCloseDialog();
      } else {
        console.error('Error saving promotion');
      }
    } catch (error) {
      console.error('Error saving promotion:', error);
    }
  };

  const handleDeletePromotion = async (promotionId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      try {
        await fetch(`http://localhost:8080/api/admin/promotions/${promotionId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        fetchPromotions();
      } catch (error) {
        console.error('Error deleting promotion:', error);
      }
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'PERCENTAGE':
        return 'primary';
      case 'FIXED_AMOUNT':
        return 'success';
      case 'BUY_X_GET_Y':
        return 'info';
      case 'FREE_SHIPPING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'PERCENTAGE':
        return 'Giảm theo phần trăm';
      case 'FIXED_AMOUNT':
        return 'Giảm số tiền cố định';
      case 'BUY_X_GET_Y':
        return 'Mua X tặng Y';
      case 'FREE_SHIPPING':
        return 'Miễn phí vận chuyển';
      default:
        return type;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatValue = (type, value) => {
    if (type === 'PERCENTAGE') {
      return `${value}%`;
    } else if (type === 'FIXED_AMOUNT') {
      return formatCurrency(value);
    } else {
      return value;
    }
  };

  const isPromotionActive = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return now >= startDate && now <= endDate && promotion.isActive;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1">
        Quản lý khuyến mãi
      </Typography>
    </Box>
  );
};

export default PromotionManage; 