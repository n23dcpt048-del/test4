require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');
const organizationRoutes = require('./routes/organizationRoutes');
const eventRoutes = require('./routes/eventRoutes'); // ← nếu bạn đã có

const app = express();

// FIX CORS 100% CHO GITHUB PAGES + LOCALHOST + MỌI DOMAIN
app.use(cors({
  origin: '*',                              // Cho phép tất cả domain gọi API
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Đề phòng trường hợp cors() chưa đủ (một số browser cũ)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Phục vụ ảnh (nếu còn dùng local uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/organizations', organizationRoutes);
app.use('/api/events', eventRoutes); // ← thêm dòng này nếu đã có route event

// Test nhanh server còn sống
app.get('/', (req, res) => {
  res.send('<h1>Backend Event Portal đang chạy ngon lành!</h1>');
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Kết nối database thành công');

    await sequelize.sync({ alter: true }); // Tự động tạo/sửa bảng, không cần migrate
    console.log('Tất cả bảng đã sẵn sàng');

    app.listen(PORT, () => {
      console.log(`Server chạy tại: https://test4-7cop.onrender.com`);
    });
  } catch (err) {
    console.error('Lỗi khởi động server:', err);
  }
}

startServer();
