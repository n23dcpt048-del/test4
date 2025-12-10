const express = require('express');
const router = express.Router();
const { getByStatus, updateStatus, createEvent, getAllEvents } = require('../controllers/eventController');

// GET /api/events/:status (pending/approved)
router.get('/:status', getByStatus);

// POST /api/events/update/:id (approve/reject/archive)
router.post('/update/:id', updateStatus);

// Giữ real data: POST /events (create)
router.post('/', createEvent);

// GET /events (all, real data)
router.get('/', getAllEvents);

// PUT /events/:id (update real data)
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ error: 'Not found' });
    await event.update(req.body);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
