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

// Serve ảnh tĩnh (giữ nguyên)
app.use('/picture', express.static(path.join(__dirname, 'picture')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/organizations', organizationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ugc', ugcRoutes);

// Trang test
app.get('/', (req, res) => {
  res.send(`
    <h1>Backend Event Portal + UGC OK!</h1>
    <p><img src="https://i.postimg.cc/h4QN9B0V/recapcsv.jpg" width="300"></p>
    <p><a href="/api/ugc/pending">Xem UGC chờ duyệt</a> | <a href="/api/ugc/approved">Xem UGC đã duyệt</a></p>
  `);
});

const PORT = process.env.PORT || 5000;

// === KHỞI ĐỘNG SERVER – ĐÃ FIX CHO RENDER ===
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Kết nối PostgreSQL OK');

    // QUAN TRỌNG: Không dùng alter: true trên Render → đổi thành force: false
    await sequelize.sync({ force: false });
    console.log('Đồng bộ bảng OK');

    // Seed dữ liệu mẫu chỉ 1 lần duy nhất
    const ugcCount = await Ugc.count();
    if (ugcCount === 0) {
      console.log('Đang seed 5 bài UGC mẫu (ảnh online)...');
      await Ugc.bulkCreate([
        {
          title: 'RECAP CSV 2025',
          author: 'Nguyễn Văn Dương',
          timestamp: '20:00:00 16/12/2025',
          imageUrl: 'https://i.postimg.cc/h4QN9B0V/recapcsv.jpg',
          status: 'pending'
        },
        {
          title: 'RECAP HCMPTIT ICPC 2025',
          author: 'Chu Văn Phong',
          timestamp: '21:34:54 9/12/2025',
          imageUrl: 'https://i.postimg.cc/pXkXwG24/recapitmc.jpg',
          status: 'pending'
        },
        {
          title: 'RECAP ASTEES COLLECTION REVEAL 2025',
          author: 'Vương Sơn Hà',
          timestamp: '22:30:00 17/12/2025',
          imageUrl: 'https://i.postimg.cc/526JjN3B/recapazone.jpg',
          status: 'pending'
        },
        {
          title: 'RECAP CASTING THE ASTRO - THE INFINITY GEN',
          author: 'Dương Minh Thoại',
          timestamp: '20:34:54 5/12/2025',
          imageUrl: 'https://i.postimg.cc/Xv15nNny/recapcmc.jpg',
          status: 'approved'
        },
        {
          title: 'RECAP - HCM PTIT MULTIMEDIA 2025',
          author: 'Lê Nhất Duy',
          timestamp: '23:34:54 7/12/2025',
          imageUrl: 'https://i.postimg.cc/K8RFdmpt/recaplcd.jpg',
          status: 'approved'
        }
      ]);
      console.log('ĐÃ SEED 5 BÀI UGC THÀNH CÔNG!');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server đang chạy: https://test4-7cop.onrender.com`);
      console.log(`Test API: https://test4-7cop.onrender.com/api/ugc/pending`);
    });

  } catch (error) {
    console.error('Lỗi khởi động server:', error.message);

    // Không để server chết hoàn toàn
    app.use((req, res) => {
      res.status(500).json({
        error: 'Server lỗi khởi động',
        message: error.message
      });
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log('Server chạy ở chế độ lỗi – chỉ để debug');
    });
  }
}

startServer();
