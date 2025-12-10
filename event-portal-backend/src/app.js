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

// Phục vụ file tĩnh - SERVE PICTURE TỪ BACKEND
app.use('/picture', express.static(path.join(__dirname, 'picture'))); // picture trong backend

// Routes
app.use('/api/organizations', organizationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ugc', ugcRoutes);

// Test
app.get('/', (req, res) => {
  res.send('<h1>Backend OK! Test ảnh: <img src="/picture/recapcsv.jpg" width="200"></h1>');
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('DB OK');

    await sequelize.sync({ alter: true });
    console.log('Sync OK');

 // === SEED UGC MẪU – DÙNG LINK ẢNH ONLINE (KHÔNG CẦN THƯ MỤC ẢNH NỮA) ===
const ugcCount = await Ugc.count();
if (ugcCount === 0 || true) { // || true để force reseed 1 lần
  console.log('Reseed UGC với ảnh online...');
  await Ugc.destroy({ where: {} }); // Xóa data cũ

  await Ugc.bulkCreate([
    {
      title: 'RECAP CSV 2025',
      author: 'Nguyễn Văn Dương',
      timestamp: '20:00:00 16/12/2025',
      imageUrl: 'https://i.imgur.com/8JZ1k8P.jpeg', // ảnh thật, đẹp
      status: 'pending'
    },
    {
      title: 'RECAP HCMPTIT ICPC 2025',
      author: 'Chu Văn Phong',
      timestamp: '21:34:54 9/12/2025',
      imageUrl: 'https://i.imgur.com/Qw1Z9kM.jpeg',
      status: 'pending'
    },
    {
      title: 'RECAP ASTEES COLLECTION REVEAL 2025',
      author: 'Vương Sơn Hà',
      timestamp: '22:30:00 17/12/2025',
      imageUrl: 'https://i.imgur.com/XkL5vP2s.jpeg',
      status: 'pending'
    },
    {
      title: 'RECAP CASTING THE ASTRO - THE INFINITY GEN',
      author: 'Dương Minh Thoại',
      timestamp: '20:34:54 5/12/2025',
      imageUrl: 'https://i.imgur.com/7pX9m3D.jpeg',
      status: 'approved'
    },
    {
      title: 'RECAP - HCM PTIT MULTIMEDIA 2025',
      author: 'Lê Nhất Duy',
      timestamp: '23:34:54 7/12/2025',
      imageUrl: 'https://i.imgur.com/Zf8vR9k.jpeg',
      status: 'approved'
    }
  ]);
  console.log('ĐÃ RESEED 5 BÀI UGC VỚI ẢNH ONLINE – ẢNH SẼ HIỆN NGAY!');
}

    app.listen(PORT, '0.0.0.0', () => console.log('Server OK'));
  } catch (err) {
    console.error('Lỗi:', err);
  }
}

startServer();
