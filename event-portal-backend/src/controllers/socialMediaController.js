// controllers/socialMediaController.js
const SocialMedia = require('../models/SocialMedia');

// Lấy tất cả
exports.getAll = async (req, res) => {
  try {
    const medias = await SocialMedia.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(medias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Tạo mới
exports.create = async (req, res) => {
  try {
    const { name, link } = req.body;
    if (!name || !link) return res.status(400).json({ error: 'Thiếu tên hoặc link' });

    const fullLink = link.startsWith('http') ? link : `https://${link}`;

    const media = await SocialMedia.create({ name, link: fullLink });
    res.status(201).json(media);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Sửa
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, link } = req.body;

    if (!name || !link) return res.status(400).json({ error: 'Thiếu dữ liệu' });

    const fullLink = link.startsWith('http') ? link : `https://${link}`;

    const media = await SocialMedia.findByPk(id);
    if (!media) return res.status(404).json({ error: 'Không tìm thấy' });

    media.name = name;
    media.link = fullLink;
    await media.save();

    res.json(media);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Xóa
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await SocialMedia.findByPk(id);
    if (!media) return res.status(404).json({ error: 'Không tìm thấy' });

    await media.destroy();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
