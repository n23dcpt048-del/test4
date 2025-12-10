require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');

// ==================== MODELS ====================
const Organization = require('./models/Organization');
const Event = require('./models/Event');
const Ugc = require('./models/Ugc');

// ==================== ROUTES ====================
const organizationRoutes = require('./routes/organizationRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ugcRoutes = require('./routes/ugcRoutes');

const app = express();

// ==================== CẤU HÌNH ====================
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve ảnh online → không cần thư mục picture/uploads nữa (nếu vẫn muốn thì bỏ comment)
app.use('/picture', express.static(path.join(__dirname, '../picture')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== ROUTES ====================
app.use('/api/organizations', organizationRoutes);
app.use('/api/events', eventRoutes);        // ← Quan trọng: quản lý sự kiện thật + duyệt
app.use('/api/ugc', ugcRoutes);

// Test server
app.get('/', (req, res) => {
  res.send(`
    <h1>Backend Event Portal đang chạy ngon lành!</h1>
    <p><a href="/api/events/pending">Test Events Pending</a> | <a href="/api/events/approved">Events Approved</a></p>
    <p><a href="/api/ugc/pending">Test UGC Pending</a></p>
  `);
});

const PORT = process.env.PORT || 5000;

// ==================== KHỞI ĐỘNG + SEED ====================
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Kết nối PostgreSQL thành công');

    await sequelize.sync({ alter: true });
    console.log('Đồng bộ bảng xong');

    // ========= SEED UGC MẪU (5 bài, ảnh online) =========
    const ugcCount = await Ugc.count();
    if (ugcCount === 0) {
      await Ugc.bulkCreate([
        { title: 'RECAP CSV 2025', author: 'Nguyễn Văn Dương', timestamp: '20:00 16/12/2025', imageUrl: 'https://i.imgur.com/8JZ1k8P.jpeg', status: 'pending' },
        { title: 'RECAP HCMPTIT ICPC 2025', author: 'Chu Văn Phong', timestamp: '21:34 9/12/2025', imageUrl: 'https://i.imgur.com/Qw1Z9kM.jpeg', status: 'pending' },
        { title: 'RECAP ASTEES 2025', author: 'Vương Sơn Hà', timestamp: '22:30 17/12/2025', imageUrl: 'https://i.imgur.com/XkL5vP2s.jpeg', status: 'pending' },
        { title: 'CASTING THE ASTRO', author: 'Dương Minh Thoại', timestamp: '20:34 5/12/2025', imageUrl: 'https://i.imgur.com/7pX9m3D.jpeg', status: 'approved' },
        { title: 'HCM PTIT MULTIMEDIA 2025', author: 'Lê Nhất Duy', timestamp: '23:34 7/12/2025', imageUrl: 'https://i.imgur.com/Zf8vR9k.jpeg', status: 'approved' }
      ]);
      console.log('Đã seed 5 UGC mẫu (ảnh online)');
    }

    // ========= SEED EVENT MẪU (5 sự kiện thật, ảnh online) =========
    const eventCount = await Event.count();
    if (eventCount === 0) {
      await Event.bulkCreate([
        {
          title: 'Sự kiện CSV 2025',
          description: 'Cuộc thi lập trình sinh viên toàn quốc',
          date: '2025-12-16',
          location: 'Hà Nội',
          imageUrl: 'https://i.imgur.com/8JZ1k8P.jpeg',
          status: 'pending'
        },
        {
          title: 'ICPC HCMPTIT 2025',
          description: 'Vòng loại ICPC khu vực miền Nam',
          date: '2025-12-09',
          location: 'TP.HCM',
          imageUrl: 'https://i.imgur.com/Qw1Z9kM.jpeg',
          status: 'pending'
        },
        {
          title: 'ASTEES COLLECTION REVEAL 2025',
          description: 'Buổi ra mắt bộ sưu tập thời trang',
          date: '2025-12-17',
          location: 'Hà Nội',
          imageUrl: 'https://i.imgur.com/XkL5vP2s.jpeg',
          status: 'pending'
        },
        {
          title: 'CASTING THE ASTRO - THE INFINITY GEN',
          description: 'Buổi casting lớn nhất năm',
          date: '2025-12-05',
          location: 'TP.HCM',
          imageUrl: 'https://i.imgur.com/7pX9m3D.jpeg',
          status: 'approved'
        },
        {
          title: 'HCM PTIT MULTIMEDIA 2025',
          description: 'Hội thảo truyền thông đa phương tiện',
          date: '2025-12-07',
          location: 'TP.HCM',
          imageUrl: 'https://i.imgur.com/Zf8vR9k.jpeg',
          status: 'approved'
        }
      ]);
      console.log('Đã seed 5 sự kiện mẫu (ảnh online)');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server chạy tại: https://test4-7cop.onrender.com`);
      console.log(`Test: https://test4-7cop.onrender.com/api/events/pending`);
    });

  } catch (error) {
    console.error('Lỗi khởi động server:', error);
    process.exit(1);
  }
}

startServer();
