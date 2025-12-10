const Event = require('../models/Event');

exports.getByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const events = await Event.findAll({ where: { status } });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    event.status = status;
    await event.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Giữ logic create/update nếu có
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
