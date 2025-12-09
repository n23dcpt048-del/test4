require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sequelize = require('./config/database');

// Import models (nếu file không tồn tại → bỏ qua lỗi)
let Organization, Event;
try { Organization = require('./models/Organization'); } catch(e) { console.log('Chưa có model Organization'); }
try { Event = require('./models/Event'); } catch(e) { console.log('Chưa có model Event'); }

const organizationRoutes = require('./routes/organizationRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/organizations', organizationRoutes);
app.use('/api/events', eventRoutes);

app.get('/', (req, res) => res.send('Backend đang chạy!'));

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('DB kết nối OK');

    await sequelize.sync({ alter: true });
    console.log('Tất cả bảng đã sẵn sàng');

    app.listen(PORT, () => {
      console.log(`Server chạy tại https://test4-7cop.onrender.com`);
    });
  } catch (err) {
    console.error('Lỗi khởi động:', err);
  }
}

start();
