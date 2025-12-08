require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');                    // ← cần để tạo thư mục
const sequelize = require('./config/database');
const organizationRoutes = require('./routes/organizationRoutes');

const app = express();

// ====================== RENDER DISKS: TỰ ĐỘNG TẠO THƯ MỤC UPLOADS ======================
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Thư mục uploads đã được tạo tự động trên Render Disk');
}
// ===================================================================================

// Middleware
app.use(cors());
app.use(express.json());

// Phục vụ file ảnh tĩnh từ Disk (rất quan trọng!)
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/organizations', organizationRoutes);

// Trang chủ đơn giản để test server còn sống
app.get('/', (req, res) => {
  res.send(`
    <h1>Event Portal Backend đang chạy ngon lành! ✅</h1>
    <p>API tổ chức: <a href="/api/organizations">/api/organizations</a></p>
    <p>Thư mục uploads: ${uploadsDir}</p>
  `);
});

// Khởi động server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Kết nối PostgreSQL thành công');

    await sequelize.sync({ alter: false }); // alter: true nếu muốn tự động sửa bảng khi dev
    console.log('Database đã được đồng bộ');

    app.listen(PORT, () => {
      console.log(`Server đang chạy tại: https://test4-7cop.onrender.com`);
      console.log(`Port: ${PORT}`);
    });
  } catch (error) {
    console.error('Lỗi khởi động server:', error);
    process.exit(1);
  }
}

startServer();
