// routes/ugcRoutes.js hgihih
const express = require('express');
const router = express.Router();
const ugcController = require('../controllers/ugcController');

// GET /api/ugc/pending hoặc /approved
router.get('/:status', ugcController.getByStatus);

// POST /api/ugc/update/5 { "status": "approved" }
router.post('/update/:id', ugcController.updateStatus);

module.exports = router;
