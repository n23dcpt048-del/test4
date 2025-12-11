require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');

// ==================== MODELS ====================
const Organization = require('./models/Organization');
const Event = require('./models/Event');
const Ugc = require('./models/Ugc');
const SocialMedia = require('./models/SocialMedia');

// ==================== ROUTES ====================
const organizationRoutes = require('./routes/organizationRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ugcRoutes = require('./routes/ugcRoutes');
const socialMediaRoutes = require('./routes/socialMediaRoutes');

const app = express();

// ==================== CẤU HÌNH ====================
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve file tĩnh
app.use('/picture', express.static(path.join(__dirname, 'picture')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== ĐĂNG KÝ ROUTES ====================
app.use('/api/organizations', organizationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ugc', ugcRoutes);
app.use('/api/social-medias', socialMediaRoutes);

// ==================== TRANG TEST ====================
app.get('/', (req, res) => {
  res.send(`
    <h1 style="text-align:center; margin-top:50px; font-family:Arial;">
      EVENT PORTAL BACKEND ĐANG CHẠY MƯỢT
    </h1>
    <p style="text-align:center;">
      <a href="/api/ugc/pending">UGC chờ duyệt</a> | 
      <a href="/api/social-medias">Danh sách mạng xã hội</a>
    </p>
  `);
});

const PORT = process.env.PORT || 5000;

// ==================== KHỞI ĐỘNG SERVER ====================
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Kết nối PostgreSQL thành công!');

    await sequelize.sync({ force: false });
    console.log('Đồng bộ bảng thành công!');

    // CHỈ SEED UGC (giữ lại để bạn còn test)
    const ugcCount = await Ugc.count();
    if (ugcCount === 0) {
      console.log('Seed 5 bài UGC mẫu...');
      await Ugc.bulkCreate([
        { title: 'RECAP CSV 2025', author: 'Nguyễn Văn Dương', timestamp: '20:00:00 16/12/2025', imageUrl: 'https://i.postimg.cc/h4QN9B0V/recapcsv.jpg', status: 'pending' },
        { title: 'RECAP HCMPTIT ICPC 2025', author: 'Chu Văn Phong', timestamp: '21:34:54 9/12/2025', imageUrl: 'https://i.postimg.cc/pXkXwG24/recapitmc.jpg', status: 'pending' },
        { title: 'RECAP ASTEES COLLECTION REVEAL 2025', author: 'Vương Sơn Hà', timestamp: '22:30:00 17/12/2025', imageUrl: 'https://i.postimg.cc/526JjN3B/recapazone.jpg', status: 'pending' },
        { title: 'RECAP CASTING THE ASTRO', author: 'Dương Minh Thoại', timestamp: '20:34:54 5/12/2025', imageUrl: 'https://i.postimg.cc/Xv15nNny/recapcmc.jpg', status: 'approved' },
        { title: 'RECAP HCM PTIT MULTIMEDIA 2025', author: 'Lê Nhất Duy', timestamp: '23:34:54 7/12/2025', imageUrl: 'https://i.postimg.cc/K8RFdmpt/recaplcd.jpg', status: 'approved' }
      ]);
      console.log('Seed UGC thành công!');
    }

    // ĐÃ XÓA HOÀN TOÀN SEED SOCIAL MEDIA → TRANG MXH SẠCH TRỐNG

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server chạy: https://test4-7cop.onrender.com`);
    });

  } catch (error) {
    console.error('Lỗi khởi động:', error.message);
    app.use((req, res) => res.status(500).json({ error: error.message }));
    app.listen(PORT, '0.0.0.0', () => console.log('Server chạy chế độ lỗi'));
  }
}

startServer();
