const Organization = require('../models/Organization');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // LƯU VÀO DISK CHÍNH CHỦ RENDER – KHÔNG BAO GIỜ MẤT
    cb(null, '/opt/render/project/src/event-portal-backend/uploads');
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'org-' + unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận file ảnh!'));
  }
}).single('avatar');

// GET all organizations
exports.getAll = async (req, res) => {
  try {
    const orgs = await Organization.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE
exports.create = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const { name, description, email, fanpage } = req.body;
      const avatar = req.file
        ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
        : `https://via.placeholder.com/70x70/007bff/ffffff?text=${encodeURIComponent(name)}`;

      const org = await Organization.create({
        name, description, email, fanpage, avatar
      });

      res.status(201).json(org);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
};

// UPDATE
exports.update = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const { id } = req.params;
      const org = await Organization.findByPk(id);
      if (!org) return res.status(404).json({ error: 'Không tìm thấy tổ chức' });

      const { name, description, email, fanpage } = req.body;

      let avatar = org.avatar;
      if (req.file) {
        // Xóa ảnh cũ nếu không phải placeholder
        if (org.avatar.includes('/uploads/')) {
          const oldPath = path.join(__dirname, '..', org.avatar.replace(`${req.protocol}://${req.get('host')}`, ''));
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        avatar = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      }

      await org.update({ name, description, email, fanpage, avatar });
      res.json(org);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
};

// DELETE
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const org = await Organization.findByPk(id);
    if (!org) return res.status(404).json({ error: 'Không tìm thấy' });

    // Xóa ảnh nếu có
    if (org.avatar.includes('/uploads/')) {
      const filePath = path.join(__dirname, '..', org.avatar.replace(`${req.protocol}://${req.get('host')}`, ''));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await org.destroy();
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

};
