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
    <h1 style="text-align:center;margin-top:80px;font-family:Arial;color:#333;">
      EVENT PORTAL BACKEND ĐANG CHẠY MƯỢT
    </h1>
    <p style="text-align:center;font-size:18px;">
      <a href="/api/ugc/pending" style="margin:0 10px;">UGC chờ duyệt</a> |
      <a href="/api/social-medias" style="margin:0 10px;">Mạng xã hội</a>
    </p>
  `);
});

const PORT = process.env.PORT || 5000;

// ==================== KHỞI ĐỘNG SERVER ====================
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Kết nối PostgreSQL thành công!');

    // RESET 1 LẦN ĐỂ TẠO BẢNG MỚI (sau lần này sửa lại thành alter: true)
    await sequelize.sync({ alter: true });  // Khuyến nghị
    console.log('RESET TOÀN BỘ BẢNG THÀNH CÔNG! Tạo mới với đầy đủ cột.');



    // ==================== SEED UGC ====================
    console.log('Đang xóa hết UGC cũ...');
    await Ugc.destroy({ truncate: true, cascade: true });
    console.log('Đang seed lại 5 bài UGC mặc định...');
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
    console.log('SEED UGC THÀNH CÔNG!');

    // ==================== SEED SỰ KIỆN MẪU ====================
         

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server chạy tại: https://test4-7cop.onrender.com`);
      console.log(`Data mẫu đã sẵn sàng: Tổ chức + UGC + 5 Events`);
    });
  } catch (error) {
    console.error('Lỗi khởi động server:', error);
    app.use((req, res) => res.status(500).json({ error: error.message }));
    app.listen(PORT, '0.0.0.0', () => console.log('Server chạy ở chế độ lỗi'));
  }
}
// ==================== API CHO TRANG THỐNG KÊ ====================
app.get('/api/stats', async (req, res) => {
  try {
    const totalEvents = await Event.count({
  where: { status: 'approved' }
});
    const pendingEvents = await Event.count({ where: { status: 'pending' } });
    const pendingUgc = await Ugc.count({ where: { status: 'pending' } });

    // Pie chart - phân bố tổ chức
    const orgDistribution = await Event.findAll({
      attributes: [
        'organizationId',
        [sequelize.fn('COUNT', sequelize.col('Event.id')), 'eventCount']
      ],
      include: [{
        model: Organization,
        attributes: ['name'],
        required: true
      }],
      group: ['Event.organizationId', 'Organization.id'],
      raw: true
    });

    let pieData = orgDistribution.map(row => ({
      label: row['Organization.name'] || 'Khác',
      value: parseInt(row.eventCount)
    }));

    const noOrgCount = await Event.count({ where: { organizationId: null } });
    if (noOrgCount > 0) {
      pieData.push({ label: 'Chưa xác định', value: noOrgCount });
    }

  
    // Biểu đồ sự kiện theo tháng (sử dụng EXTRACT - chuẩn PostgreSQL)
const monthlyEvents = await Event.findAll({
  attributes: [
    [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "Event"."startTime"')), 'month'],
    [sequelize.fn('COUNT', sequelize.col('Event.id')), 'count']
  ],
  group: [sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM "Event"."startTime"'))],
  raw: true
});

const monthlyData = Array(12).fill(0);
monthlyEvents.forEach(row => {
  const monthIndex = parseInt(row.month) - 1;
  if (monthIndex >= 0 && monthIndex < 12) {
    monthlyData[monthIndex] += parseInt(row.count);
  }
});

    res.json({
      totalEvents,
      pendingEvents,
      pendingUgc,
      pieData,
      monthlyData
    });
  } catch (error) {
    console.error('Lỗi lấy stats:', error);
    res.status(500).json({ error: 'Lỗi server thống kê: ' + error.message });
  }
});
startServer();

