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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const ProductManage = () => {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Mock data - sẽ được thay thế bằng API call
  const products = [
    {
      id: 1,
      name: 'Đồng hồ Casio',
      price: '1,500,000đ',
      category: 'Casio',
      stock: 10,
    },
    {
      id: 2,
      name: 'Đồng hồ Seiko',
      price: '2,500,000đ',
      category: 'Seiko',
      stock: 5,
    },
  ];

  const handleOpen = (product = null) => {
    setSelectedProduct(product);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedProduct(null);
    setOpen(false);
  };

  const handleSave = () => {
    // Xử lý lưu sản phẩm
    handleClose();
  };

  const handleDelete = (id) => {
    // Xử lý xóa sản phẩm
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Quản lý sản phẩm
      </Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Thêm sản phẩm
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(product.id)}>
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
          {selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên sản phẩm"
            fullWidth
            defaultValue={selectedProduct?.name}
          />
          <TextField
            margin="dense"
            label="Giá"
            fullWidth
            defaultValue={selectedProduct?.price}
          />
          <TextField
            margin="dense"
            label="Danh mục"
            fullWidth
            defaultValue={selectedProduct?.category}
          />
          <TextField
            margin="dense"
            label="Số lượng"
            type="number"
            fullWidth
            defaultValue={selectedProduct?.stock}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductManage; 