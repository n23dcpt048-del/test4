// src/controllers/eventController.js
const Event = require('../models/Event');
const Organization = require('../models/Organization');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'event-portal/events',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
});

const upload = multer({ storage });

// GET all events + populate organization name
exports.getAll = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [{ model: Organization, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(events);
  } catch (err) {
    console.error('Lỗi getAll events:', err);
    res.status(500).json({ error: err.message });
  }
};

// CREATE event
exports.create = [
  upload.single('image'),
  async (req, res) => {
    try {
      const {
        name,
        description,
        startTime,
        endTime,
        registrationDeadline,
        location,
        registrationLink,
        organizationId,
        channels
      } = req.body;

      const image = req.file ? req.file.path : null;

      // FIX: Xử lý organizationId rỗng hoặc "-----" → null
      let orgId = null;
      if (organizationId && organizationId.trim() !== '' && organizationId !== '-----') {
        orgId = parseInt(organizationId, 10);
        if (isNaN(orgId)) orgId = null;
      }

      const event = await Event.create({
        name,
        description,
        startTime,
        endTime,
        registrationDeadline,
        location,
        registrationLink,
        image,
        organizationId: orgId,
        channels: channels ? JSON.parse(channels) : ['web']
      });

      const result = await Event.findByPk(event.id, {
        include: [{ model: Organization, attributes: ['name'] }]
      });

      res.status(201).json(result);
    } catch (err) {
      console.error('Lỗi tạo event:', err);
      res.status(400).json({ error: err.message });
    }
  }
];

// UPDATE event
exports.update = [
  upload.single('image'),
  async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });

      const {
        name,
        description,
        startTime,
        endTime,
        registrationDeadline,
        location,
        registrationLink,
        organizationId,
        channels
      } = req.body;

      const image = req.file ? req.file.path : event.image;

      // FIX: Xử lý organizationId rỗng hoặc "-----" → null
      let orgId = null;
      if (organizationId && organizationId.trim() !== '' && organizationId !== '-----') {
        orgId = parseInt(organizationId, 10);
        if (isNaN(orgId)) orgId = null;
      }

      await event.update({
        name,
        description,
        startTime,
        endTime,
        registrationDeadline,
        location,
        registrationLink,
        image,
        organizationId: orgId,
        channels: channels ? JSON.parse(channels) : event.channels
      });

      const updated = await Event.findByPk(event.id, {
        include: [{ model: Organization, attributes: ['name'] }]
      });

      res.json(updated);
    } catch (err) {
      console.error('Lỗi update event:', err);
      res.status(400).json({ error: err.message });
    }
  }
];

// DELETE event
exports.delete = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });

    // Xóa ảnh Cloudinary nếu có
    if (event.image) {
      const publicId = event.image.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await event.destroy();
    res.json({ message: 'Xóa sự kiện thành công' });
  } catch (err) {
    console.error('Lỗi delete event:', err);
    res.status(500).json({ error: err.message });
  }
};

// CHANGE STATUS (duyệt / từ chối)
exports.changeStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'pending' hoặc 'approved'
    if (!['pending', 'approved'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }

    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });

    await event.update({ status });
    res.json({ message: 'Cập nhật trạng thái thành công' });
  } catch (err) {
    console.error('Lỗi change status:', err);
    res.status(400).json({ error: err.message });
  }
};
