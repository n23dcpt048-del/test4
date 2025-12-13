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
       console.log('Đang seed 5 sự kiện mẫu...');
    await Event.bulkCreate([
      {
        name: 'ASTEES COLLECTION REVEAL',
        description: 'Sự kiện thời trang ASTEEs Collection Reveal đã chính thức mở form đăng ký.',
        startTime: '2026-11-23T10:00:00',
        endTime: '2026-11-23T15:00:00',
        registrationDeadline: '2026-10-23T23:00:00',
        location: 'Hội trường D - Học viện Công nghệ Bưu chính Viễn thông Cơ sở TPHCM',
        registrationLink: 'https://forms.gle/DdqnFSqYmFawhLqg6',
        image: 'https://scontent.fdad3-5.fna.fbcdn.net/v/t39.30808-6/565116867_122109067953007168_7188552843937308533_n.jpg',
        status: 'pending',
        channels: ['web'],
        organizationId: orgs.find(o => o.name === 'A'zone').id
      },
      {
        name: 'FABULOUS-ITMC MỞ ĐƠN TUYỂN THÀNH VIÊN',
        description: 'Mở đơn tuyển thành viên mới cho ITMC.',
        startTime: '2025-11-25T07:00:00',
        endTime: '2025-11-25T15:00:00',
        registrationDeadline: '2025-11-24T20:00:00',
        location: 'Học viện Công nghệ Bưu chính Viễn thông – Cơ sở TP.HCM',
        registrationLink: 'https://forms.gle/6fCD8ZMh6oDHYtsu6',
        image: 'https://scontent.fdad3-1.fna.fbcdn.net/v/t39.30808-6/547828632_1216108510557641_566180599963180957_n.jpg',
        status: 'pending',
        channels: ['web'],
        organizationId: orgs.find(o => o.name === 'ITMC').id
      },
      {
        name: 'MARTIST – KHI THANH XUÂN CẤT TIẾNG',
        description: 'Gala D25 trở lại với cuộc thi MArtist.',
        startTime: '2026-11-25T07:00:00',
        endTime: '2026-11-25T15:00:00',
        registrationDeadline: '2026-11-24T20:00:00',
        location: 'Hội trường D – Học viện Công nghệ Bưu chính Viễn thông',
        registrationLink: 'https://forms.gle/SoMUjShn7mnULVUT9',
        image: 'https://scontent.fdad3-5.fna.fbcdn.net/v/t39.30808-6/574564898_1454449043350192_975546984353294738_n.jpg',
        status: 'pending',
        channels: ['web'],
        organizationId: orgs.find(o => o.name === 'A'zone').id
      },
      {
        name: 'THE ASTRO - THE INFINITY GENERATION',
        description: 'Mở đơn đăng ký tuyển thành viên THE ASTRO.',
        startTime: '2025-12-02T07:30:00',
        endTime: '2025-12-02T17:00:00',
        registrationDeadline: '2025-11-24T20:00:00',
        location: 'Hội trường D, Học viện Công nghệ Bưu chính Viễn thông – Cơ sở TP.HCM',
        registrationLink: 'https://forms.gle/7pVGy2kN9t7WJRbr6',
        image: 'https://scontent.fdad3-4.fna.fbcdn.net/v/t39.30808-6/545054403_1242826237861546_7230088209638397878_n.jpg',
        status: 'approved',
        channels: ['web'],
        organizationId: orgs.find(o => o.name === 'LCDCNDPT').id
      },
      {
        name: 'HCM PTIT MULTIMEDIA 2025',
        description: 'Cuộc thi HCM PTIT MULTIMEDIA 2025 – Biến ý tưởng thành hiện thực!',
        startTime: '2026-12-02T07:30:00',
        endTime: '2026-12-02T17:00:00',
        registrationDeadline: '2026-11-23T23:59:00',
        location: 'Hội trường 2A08, Học viện Công nghệ Bưu chính Viễn thông – Cơ sở TP.HCM',
        registrationLink: 'https://forms.gle/example-link',
        image: 'https://scontent.fdad3-4.fna.fbcdn.net/v/t39.30808-6/566219856_1231088645726163_5271916207151874176_n.jpg',
        status: 'approved',
        channels: ['web', 'facebook', 'zalo'],
        organizationId: orgs.find(o => o.name === 'LCDCNDPT').id
      }
    ], { ignoreDuplicates: true });
    console.log('SEED 5 SỰ KIỆN MẪU THÀNH CÔNG! (3 pending + 2 approved)');

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

startServer();




