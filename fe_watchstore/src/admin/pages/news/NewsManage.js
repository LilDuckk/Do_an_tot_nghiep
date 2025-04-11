import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Editor } from '@tinymce/tinymce-react';

const NewsManage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [dialogType, setDialogType] = useState(''); // 'view', 'edit', 'add'
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [newNewsTemplate, setNewNewsTemplate] = useState({
    title: '',
    content: '',
    summary: '',
    status: 'draft',
    category: 'general',
    imageUrl: '',
    author: '',
    tags: [],
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/news', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách tin tức');
      }

      const data = await response.json();
      setNews(data);
    } catch (err) {
      setError(err.message);
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (type, newsItem = null) => {
    setDialogType(type);
    if (type === 'add') {
      setSelectedNews(newNewsTemplate);
    } else {
      setSelectedNews(newsItem);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedNews(null);
    setDialogType('');
  };

  const handleInputChange = (field, value) => {
    setSelectedNews({
      ...selectedNews,
      [field]: value,
    });
  };

  const handleSaveNews = async () => {
    try {
      const url = dialogType === 'add'
        ? 'http://localhost:8080/api/admin/news'
        : `http://localhost:8080/api/admin/news/${selectedNews.id}`;

      const method = dialogType === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(selectedNews),
      });

      if (!response.ok) {
        throw new Error(`Không thể ${dialogType === 'add' ? 'thêm' : 'cập nhật'} tin tức`);
      }

      showSnackbar(`${dialogType === 'add' ? 'Thêm' : 'Cập nhật'} tin tức thành công`, 'success');
      fetchNews();
      handleCloseDialog();
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleDeleteNews = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/news/${selectedNews.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể xóa tin tức');
      }

      showSnackbar('Xóa tin tức thành công', 'success');
      fetchNews();
      handleCloseDialog();
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'published':
        return 'Đã xuất bản';
      case 'draft':
        return 'Bản nháp';
      case 'archived':
        return 'Đã lưu trữ';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý tin tức
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Thêm tin tức
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Tác giả</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {news
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((newsItem) => (
                <TableRow key={newsItem.id}>
                  <TableCell>{newsItem.id}</TableCell>
                  <TableCell>{newsItem.title}</TableCell>
                  <TableCell>{newsItem.category}</TableCell>
                  <TableCell>{newsItem.author}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(newsItem.status)}
                      color={getStatusColor(newsItem.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(newsItem.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog('view', newsItem)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog('edit', newsItem)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDialog('delete', newsItem)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={news.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
        />
      </TableContainer>

      {/* View Dialog */}
      <Dialog
        open={openDialog && dialogType === 'view'}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedNews && (
          <>
            <DialogTitle>{selectedNews.title}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Tóm tắt:</Typography>
                  <Typography>{selectedNews.summary}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Nội dung:</Typography>
                  <div dangerouslySetInnerHTML={{ __html: selectedNews.content }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Danh mục:</Typography>
                  <Typography>{selectedNews.category}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Tác giả:</Typography>
                  <Typography>{selectedNews.author}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Trạng thái:</Typography>
                  <Chip
                    label={getStatusLabel(selectedNews.status)}
                    color={getStatusColor(selectedNews.status)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Ngày tạo:</Typography>
                  <Typography>
                    {new Date(selectedNews.createdAt).toLocaleString('vi-VN')}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit/Add Dialog */}
      <Dialog
        open={openDialog && (dialogType === 'edit' || dialogType === 'add')}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedNews && (
          <>
            <DialogTitle>
              {dialogType === 'add' ? 'Thêm tin tức mới' : 'Chỉnh sửa tin tức'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tiêu đề"
                    value={selectedNews.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tóm tắt"
                    multiline
                    rows={2}
                    value={selectedNews.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Nội dung:
                  </Typography>
                  <Editor
                    apiKey="your-tinymce-api-key"
                    value={selectedNews.content}
                    onEditorChange={(content) => handleInputChange('content', content)}
                    init={{
                      height: 400,
                      menubar: true,
                      plugins: [
                        'advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table paste code help wordcount',
                      ],
                      toolbar:
                        'undo redo | formatselect | bold italic backcolor | \
                        alignleft aligncenter alignright alignjustify | \
                        bullist numlist outdent indent | removeformat | help',
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                      value={selectedNews.category}
                      label="Danh mục"
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    >
                      <MenuItem value="general">Tin chung</MenuItem>
                      <MenuItem value="product">Sản phẩm</MenuItem>
                      <MenuItem value="promotion">Khuyến mãi</MenuItem>
                      <MenuItem value="event">Sự kiện</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tác giả"
                    value={selectedNews.author}
                    onChange={(e) => handleInputChange('author', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="URL hình ảnh"
                    value={selectedNews.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={selectedNews.status}
                      label="Trạng thái"
                      onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                      <MenuItem value="draft">Bản nháp</MenuItem>
                      <MenuItem value="published">Xuất bản</MenuItem>
                      <MenuItem value="archived">Lưu trữ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Hủy</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveNews}
              >
                {dialogType === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={openDialog && dialogType === 'delete'}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa tin tức này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteNews}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default NewsManage; 