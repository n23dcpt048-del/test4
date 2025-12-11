// controllers/ugcController.js
const Ugc = require('../models/Ugc');

exports.getByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!['pending', 'approved', 'rejected', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Status không hợp lệ' });
    }

    const ugcs = await Ugc.findAll({
      where: { status },
      order: [['createdAt', 'DESC']]
    });

    res.json(ugcs);
  } catch (error) {
    console.error('Lỗi getByStatus:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Status không hợp lệ' });
    }

    const ugc = await Ugc.findByPk(id);
    if (!ugc) return res.status(404).json({ error: 'Không tìm thấy bài viết' });

    ugc.status = status;
    await ugc.save();

    res.json({ success: true, newStatus: status });
  } catch (error) {
    console.error('Lỗi updateStatus:', error);
    res.status(500).json({ error: error.message });
  }
};
