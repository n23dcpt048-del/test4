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
const Contact = require('./models/Contact'); // ← THÊM MỚI

// ==================== ROUTES ====================
const organizationRoutes = require('./routes/organizationRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ugcRoutes = require('./routes/ugcRoutes');
const socialMediaRoutes = require('./routes/socialMediaRoutes');
const contactRoutes = require('./routes/contactRoutes'); // ← THÊM MỚI

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
app.use('/api/contact', contactRoutes); // ← THÊM MỚI

// ==================== TRANG TEST ====================
app.get('/', (req, res) => {
  res.send(`
    <h1 style="text-align:center;margin-top:80px;font-family:Arial;color:#333;">
      EVENT PORTAL BACKEND ĐANG CHẠY MƯỢT
    </h1>
    <p style="text-align:center;font-size:18px;">
      <a href="/api/ugc/pending" style="margin:0 10px;">UGC chờ duyệt</a> |
      <a href="/api/social-medias" style="margin:0 10px;">Mạng xã hội</a> |
      <a href="/api/contact" style="margin:0 10px;">Thông tin liên lạc</a>
    </p>
  `);
});

const PORT = process.env.PORT || 5000;

// ==================== KHỞI ĐỘNG SERVER ====================
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Kết nối PostgreSQL thành công!');

    // Sync tất cả models (alter để thêm cột mới nếu cần)
    await sequelize.sync({ alter: true });
    console.log('SYNC TOÀN BỘ BẢNG THÀNH CÔNG!');

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
    console.log('Xóa các sự kiện mẫu cũ...');
    await Event.destroy({
      where: {
        name: [
          'ASTEES COLLECTION REVEAL',
          'FABULOUS-ITMC MỞ ĐƠN TUYỂN THÀNH VIÊN',
          'MARTIST – KHI THANH XUÂN CẤT TIẾNG',
          'THE ASTRO - THE INFINITY GENERATION',
          'HCM PTIT MULTIMEDIA 2025'
        ]
      }
    });

    console.log('Đang seed 5 sự kiện mẫu (3 chờ duyệt + 2 đã duyệt)...');
    try {
      await Event.bulkCreate([
        // 3 sự kiện CHỜ DUYỆT
        {
          name: 'ASTEES COLLECTION REVEAL',
          description: 'Loa loa loa… Không để các bạn phải chờ lâu thêm nữa, sự kiện thời trang ASTEEs Collection Reveal đã chính thức mở form đăng ký rồi đây.',
          startTime: '2026-11-23T10:00:00',
          endTime: '2026-11-23T15:00:00',
          registrationDeadline: '2026-10-23T23:00:00',
          location: 'Hội trường D - Học viện Công nghệ Bưu chính Viễn thông Cơ sở TPHCM',
          registrationLink: 'https://forms.gle/DdqnFSqYmFawhLqg6',
          image: 'https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/550290142_122104165029007168_2086284108334656361_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=100&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=4rrFDI2Es18Q7kNvwF9_XJ4&_nc_oc=AdkmYxDSQQl-CDUIMyANHpXQFanSofJbNYZoAJVz2lqUiGZsWNklQimxFZA0dwLT3YI&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=faBdVJxJEMxm711US-sOLQ&oh=00_Aflbas5UqSGgpQTQ1mAXsFo42Jm68a_B-UEggrbCurTyMw&oe=69487D5F',
          status: 'pending',
          channels: ['web'],
          organizationId: 25
        },
        {
          name: 'FABULOUS-ITMC MỞ ĐƠN TUYỂN THÀNH VIÊN',
          description: 'Mở đơn tuyển thành viên mới cho ITMC – cơ hội để bạn thử sức trong môi trường sáng tạo và năng động.',
          startTime: '2025-11-25T07:00:00',
          endTime: '2025-11-25T15:00:00',
          registrationDeadline: '2025-11-24T20:00:00',
          location: 'Học viện Công nghệ Bưu chính Viễn thông – Cơ sở TP.HCM',
          registrationLink: 'https://forms.gle/6fCD8ZMh6oDHYtsu6',
          image: 'https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/547453886_1215997780568714_2352432209521607908_n.jpg?stp=dst-jpg_p180x540_tt6&_nc_cat=107&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=cF-OCsChGx8Q7kNvwH2ljU5&_nc_oc=Adn1_GE9BBYZVduSjI73e_vF6dLiVcwmYMzM21vsLDZ-8b-eY_WSjwNCi52XRzr6I1Q&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=8KIRvCBMolmnuZLVQJ76rg&oh=00_AfnxqsR6QnHR4loYEchGAVvY7P6l_lurk3tqbMBtcyGXqg&oe=69489BC8',
          status: 'pending',
          channels: ['web'],
          organizationId: 22
        },
        {
          name: 'MARTIST – KHI THANH XUÂN CẤT TIẾNG',
          description: '"Tuổi trẻ – đừng im lặng. Hãy để âm nhạc nói thay lòng mình." Gala D25 trở lại với cuộc thi MArtist.',
          startTime: '2026-11-25T07:00:00',
          endTime: '2026-11-25T15:00:00',
          registrationDeadline: '2026-11-24T20:00:00',
          location: 'Hội trường D – Học viện Công nghệ Bưu chính Viễn thông',
          registrationLink: 'https://forms.gle/SoMUjShn7mnULVUT9',
          image: 'https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/572089425_1452357286892701_8341956418215394135_n.jpg?stp=dst-jpg_p526x296_tt6&_nc_cat=111&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=7AHKr9rHZV8Q7kNvwF11570&_nc_oc=Adkl72Ngm3sN_sWGYaIr6O5XWi50ARqUS_WV1nCn9b308QRfPirAZWgl5Q5j-cL0ieo&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=yoTByvHPHRG_Ochk0yk3_A&oh=00_Afny6BC7acY1rE42e0vbkjGDfdzAltN-offrthQ0mgTkLA&oe=6948AEAB',
          status: 'pending',
          channels: ['web'],
          organizationId: 20
        },
        // 2 sự kiện ĐÃ DUYỆT
        {
          name: 'THE ASTRO - THE INFINITY GENERATION',
          description: 'CHÍNH THỨC MỞ ĐƠN ĐĂNG KÝ TUYỂN THÀNH VIÊN: THE ASTRO - THE INFINITY GENERATION',
          startTime: '2025-12-02T07:30:00',
          endTime: '2025-12-02T17:00:00',
          registrationDeadline: '2025-11-24T20:00:00',
          location: 'Hội trường D, Học viện Công nghệ Bưu chính Viễn thông – Cơ sở TP.HCM',
          registrationLink: 'https://forms.gle/7pVGy2kN9t7WJRbr6',
          image: 'https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/545054403_1242826237861546_7230088209638397878_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=104&ccb=1-7&_nc_sid=127cfc&_nc_ohc=BPz4fcF5ITYQ7kNvwEUIhf_&_nc_oc=AdmBavqA49dTvNNJtsH-EGWli8oYq_ufkVBEG95vChhKsUilYXs36c53Qq5KhzbzYRM&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=UmlAmJcO32CRAjITceEeoA&oh=00_Afl2fThdVBAUev6hiEHIiIBF3WGRjaLB8vrunN7iR2oWQA&oe=694897B6',
          status: 'approved',
          channels: ['web'],
          organizationId: 21
        },
        {
          name: 'HCM PTIT MULTIMEDIA 2025',
          description: 'Cuộc thi HCM PTIT MULTIMEDIA 2025 – Biến ý tưởng thành hiện thực!',
          startTime: '2026-12-02T07:30:00',
          endTime: '2026-12-02T17:00:00',
          registrationDeadline: '2026-11-23T23:59:00',
          location: 'Hội trường 2A08, Học viện Công nghệ Bưu chính Viễn thông – Cơ sở TP.HCM',
          registrationLink: 'https://forms.gle/example-link',
          image: 'https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/565182686_1231089619059399_2209099145158360001_n.png?stp=dst-jpg_tt6&_nc_cat=102&ccb=1-7&_nc_sid=86c6b0&_nc_ohc=fSRlPDPTAckQ7kNvwEFXjuP&_nc_oc=Adkfk7XG4BJASmlYJX5-fVprXqbM5I-BD42oH3wiNhcFYRvD7f6cFKO17NwtrVLHQzI&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=tjxsCrUDxAsCREZUg_EsTQ&oh=00_AfmKGmPSDUZUPnFHfnrKcFUv_IBJWDPkRAe0hWOOLx1Afw&oe=69488241',
          status: 'approved',
          channels: ['web', 'facebook', 'zalo'],
          organizationId: 18
        }
      ], { ignoreDuplicates: true });
      console.log('SEED 5 SỰ KIỆN MẪU THÀNH CÔNG! (3 chờ duyệt + 2 đã duyệt)');
    } catch (seedError) {
      console.error('Lỗi seed sự kiện mẫu:', seedError);
    }

    // ==========================================================
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server chạy tại: https://test4-7cop.onrender.com`);
      console.log(`Data mẫu đã sẵn sàng: Tổ chức + UGC + 5 Events + Social Media + Contact`);
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
    const totalEvents = await Event.count();
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

    // Biểu đồ sự kiện theo tháng
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


