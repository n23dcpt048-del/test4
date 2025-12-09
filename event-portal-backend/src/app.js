const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');
const organizationRoutes = require('./routes/organizationRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // phục vụ ảnh

// Routes
app.use('/api/organizations', organizationRoutes);

// Sync DB + Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.sync({ force: false }); // force: true chỉ dùng dev
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
}

startServer();
