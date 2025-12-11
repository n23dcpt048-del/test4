// routes/socialMediaRoutes.js
const express = require('express');
const router = express.Router();
const socialMediaController = require('../controllers/socialMediaController');

// GET  /api/social-medias
router.get('/', socialMediaController.getAll);

// POST /api/social-medias
router.post('/', socialMediaController.create);

// PUT  /api/social-medias/:id
router.put('/:id', socialMediaController.update);

// DELETE /api/social-medias/:id
router.delete('/:id', socialMediaController.remove);

module.exports = router;
