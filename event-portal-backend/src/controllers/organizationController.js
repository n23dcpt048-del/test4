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

// GET all events + join với Organization
exports.getAll = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [{ model: Organization, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE
exports.create = [
  upload.single('coverImage'),
  async (req, res) => {
    try {
      const coverImage = req.file ? req.file.path : null;
      const event = await Event.create({
        ...req.body,
        coverImage,
        organizationId: parseInt(req.body.organizationId),
        channels: req.body.channels ? JSON.parse(req.body.channels) : ['web']
      });
      const result = await Event.findByPk(event.id, { include: Organization });
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
];

// UPDATE
exports.update = [
  upload.single('coverImage'),
  async (req, res) => {
    try {
      const event = await Event.findByPk(req.params.id);
      if (!event) return res.status(404).json({ error: 'Không tìm thấy' });
      
      const coverImage = req.file ? req.file.path : event.coverImage;
      await event.update({
        ...req.body,
        coverImage,
        organizationId: parseInt(req.body.organizationId),
        channels: req.body.channels ? JSON.parse(req.body.channels) : event.channels
      });
      const updated = await Event.findByPk(event.id, { include: Organization });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
];

// DELETE
exports.delete = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Không tìm thấy' });
    if (event.coverImage) {
      const publicId = event.coverImage.split('/').slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    await event.destroy();
    res.json({ message: 'Xóa thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
