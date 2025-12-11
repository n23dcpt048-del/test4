// routes/ugcRoutes.js - THÊM ROUTE POST CHO UPDATE STATUS

const express = require('express');
const router = express.Router();
const Ugc = require('../models/Ugc');

// GET /api/ugc/:status (pending/approved) - Giữ nguyên
router.get('/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const ugcs = await Ugc.findAll({ where: { status } });
    res.json(ugcs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ugc/update/:id - Route mới cho approve/reject/archive
router.post('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['approved', 'rejected', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const ugc = await Ugc.findByPk(id);
    if (!ugc) return res.status(404).json({ error: 'UGC not found' });
    ugc.status = status;
    await ugc.save();
    res.json({ success: true, newStatus: status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
