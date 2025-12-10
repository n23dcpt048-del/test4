const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// GET /api/events/:status (pending/approved – cho tab)
router.get('/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const events = await Event.findAll({ where: { status } });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events/update/:id (approve/reject/archive)
router.post('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    event.status = status;
    await event.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events (tạo sự kiện thật – lưu DB)
router.post('/', async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events (tất cả sự kiện thật)
router.get('/', async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
