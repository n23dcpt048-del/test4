require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');

// Models
const Organization = require('./models/Organization');
const Event = require('./models/Event');
const Ugc = require('./models/Ugc');

// Routes
const organizationRoutes = require('./routes/organizationRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ugcRoutes = require('./routes/ugcRoutes');

const app = express();

// Cấu hình
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ file tĩnh
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/picture', express.static(path.join(__dirname, '../picture'))); // backup nếu cần

// Routes
app.use('/api/organizations', organizationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ugc', ugcRoutes);

// Trang test
app.get('/', (req, res) => {
  res.send('<h1>Backend Event Portal + UGC đang chạy!</h1>');
});

const PORT = process.env.PORT || 5000;

// KHỞI ĐỘNG SERVER + SEED DATA
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Kết nối PostgreSQL thành công');

    await sequelize.sync({ alter: true });
    console.log('Đồng bộ bảng xong');

    // Seed UGC mẫu – ĐÃ SỬA ĐƯỜNG DẪN ẢNH DÙNG /uploads
    const ugcCount = await Ugc.count();
    if (ugcCount === 0) {
      await Ugc.bulkCreate([
        {
          title: 'RECAP CSV 2025',
          author: 'Nguyễn Văn Dương',
          timestamp: '20:00:00 16/12/2025',
          imageUrl: '/uploads/recapcsv.jpg',
          status: 'pending'
        },
        {
          title: 'RECAP HCMPTIT ICPC 2025',
          author: 'Chu Văn Phong',
          timestamp: '21:34:54 9/12/2025',
          imageUrl: '/uploads/recapitmc.jpg',
          status: 'pending'
        },
        {
          title: 'RECAP ASTEES COLLECTION REVEAL 2025',
          author: 'Vương Sơn Hà',
          timestamp: '22:30:00 17/12/2025',
          imageUrl: '/uploads/recapazone.jpg',
          status: 'pending'
        },
        {
          title: 'RECAP CASTING THE ASTRO - THE INFINITY GEN',
          author: 'Dương Minh Thoại',
          timestamp: '20:34:54 5/12/2025',
          imageUrl: '/uploads/recapcmc.jpg',
          status: 'approved'
        },
        {
          title: 'RECAP - HCM PTIT MULTIMEDIA 2025',
          author: 'Lê Nhất Duy',
          timestamp: '23:34:54 7/12/2025',
          imageUrl: '/uploads/recaplcd.jpg',
          status: 'approved'
        }
      ]);
      console.log('Đã tạo 5 bài UGC mẫu (ảnh từ /uploads)');
    } else {
      console.log(`Đã có ${ugcCount} bài UGC, bỏ qua seed`);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server chạy tại: https://test4-7cop.onrender.com`);
    });

  } catch (error) {
    console.error('Lỗi khởi động server:', error);
    process.exit(1);
  }
}

// Chạy server
startServer();
