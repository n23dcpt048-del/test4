const express = require('express');
const router = express.Router();
const ugcController = require('../controllers/ugcController');

// GET /api/ugc/:status (pending hoặc approved)
router.get('/:status', ugcController.getByStatus);

// POST /api/ugc/:id/status (update status: approve, reject, archive)
router.post('/:id/status', ugcController.updateStatus);

module.exports = router;
