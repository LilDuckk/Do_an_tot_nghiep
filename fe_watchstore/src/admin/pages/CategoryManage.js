import React, { useState } from 'react';
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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import '../../assets/css/admin/pages/CategoryManage.css';

const CategoryManage = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Đồng hồ nam', description: 'Các loại đồng hồ dành cho nam' },
    { id: 2, name: 'Đồng hồ nữ', description: 'Các loại đồng hồ dành cho nữ' },
    { id: 3, name: 'Đồng hồ trẻ em', description: 'Các loại đồng hồ dành cho trẻ em' },
  ]);

  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleOpen = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (editingCategory) {
      // Cập nhật danh mục
      setCategories(categories.map(cat =>
        cat.id === editingCategory.id
          ? { ...cat, ...formData }
          : cat
      ));
    } else {
      // Thêm danh mục mới
      const newCategory = {
        id: categories.length + 1,
        ...formData,
      };
      setCategories([...categories, newCategory]);
    }
    handleClose();
  };

  const handleDelete = (id) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  return (
    <Container className="category-container">
      <div className="category-header">
        <Typography variant="h4" component="h1">
          Quản lý danh mục
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          Thêm danh mục
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table className="category-table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên danh mục</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell className="action-cell">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpen(category)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(category.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Tên danh mục"
            type="text"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="Mô tả"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingCategory ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoryManage; 