require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');

// === MODELS ===
const Organization = require('./models/Organization');
const Event = require('./models/Event');
const Ugc = require('./models/Ugc'); // Model UGC

// === ROUTES ===
const organizationRoutes = require('./routes/organizationRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ugcRoutes = require('./routes/ugcRoutes'); // Route UGC mới

const app = express();

// ======================
// CẤT ĐỊNH CƠ BẢN
// ======================
app.use(cors({ origin: '*' })); // Cho phép frontend (GitHub Pages, localhost, mọi nơi) gọi API

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ file tĩnh
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/picture', express.static(path.join(__dirname, '../picture'))); // Quan trọng: phục vụ ảnh UGC

// ======================
// ROUTES
// ======================
app.use('/api/organizations', organizationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ugc', ugcRoutes); // Route mới cho quản lý nội dung người dùng

// Test server còn sống
app.get('/', (req, res) => {
  res.send(`
    <h1>Backend Event Portal + UGC đang chạy ngon lành!</h1>
    <p><strong>API UGC:</strong></p>
    <ul>
      <li>GET <a href="/api/ugc/pending">/api/ugc/pending</a></li>
      <li>GET <a href="/api/ugc/approved">/api/ugc/approved</a></li>
      <li>POST /api/ugc/update/:id → { "status": "approved" | "rejected" | "archived" }</li>
    </ul>
  `);
});

const PORT = process.env.PORT || 5000;

// ======================
// KHỞI ĐỘNG SERVER + SEED DATA
// ======================
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Kết nối PostgreSQL thành công');

    await sequelize.sync({ alter: true }); // Tạo bảng nếu chưa có, sửa nếu thay đổi
    console.log('Đồng bộ bảng xong');

// Seed 5 bài UGC mẫu – ĐÃ SỬA ĐƯỜNG DẪN ẢNH
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
  console.log('Đã tạo 5 bài UGC mẫu với ảnh từ /uploads');
}
    } else {
      console.log(`Đã có ${ugcCount} bài UGC, bỏ qua seed`);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server chạy tại: https://test4-7cop.onrender.com`);
      console.log(`API UGC: https://test4-7cop.onrender.com/api/ugc/pending`);
    });

  } catch (error) {
    console.error('Lỗi khởi động server:', error);
    process.exit(1);
  }
}

startServer();

