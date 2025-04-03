import React from 'react';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const styles = {
  adminContainer: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  adminContent: {
    marginTop: '20px',
    '& h1': {
      marginBottom: '30px',
      color: '#333',
    },
  },
  adminStats: {
    marginBottom: '30px',
  },
  adminCard: {
    padding: '20px',
    height: '100%',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
    },
    '& h2': {
      color: '#666',
      fontSize: '1.1rem',
      marginBottom: '10px',
    },
    '& h4': {
      color: '#1976d2',
      fontSize: '1.8rem',
      margin: 0,
    },
  },
  chartContainer: {
    '& .recharts-wrapper': {
      margin: '0 auto',
    },
    '& .recharts-default-tooltip': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '10px',
    },
  },
};

const AdminDashboard = () => {
  // Mock data - sẽ được thay thế bằng API call
  const salesData = [
    { name: 'T1', sales: 4000 },
    { name: 'T2', sales: 3000 },
    { name: 'T3', sales: 2000 },
    { name: 'T4', sales: 2780 },
    { name: 'T5', sales: 1890 },
    { name: 'T6', sales: 2390 },
    { name: 'T7', sales: 3490 },
  ];

  const stats = [
    { title: 'Doanh thu', value: '15,000,000đ' },
    { title: 'Đơn hàng mới', value: '25' },
    { title: 'Khách hàng mới', value: '10' },
    { title: 'Sản phẩm bán chạy', value: '5' },
  ];

  return (
    <Box sx={styles.adminContainer}>
      <Container sx={styles.adminContent}>
        <Typography variant="h4" component="h1">
          Bảng điều khiển
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={styles.adminStats}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper sx={styles.adminCard}>
                <Typography variant="h6" component="h2">
                  {stat.title}
                </Typography>
                <Typography variant="h4">
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Sales Chart */}
        <Paper sx={styles.adminCard}>
          <Typography variant="h6" component="h2" gutterBottom>
            Doanh số bán hàng
          </Typography>
          <Box sx={{ height: 300 }} className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminDashboard; 