// src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// GET tất cả sự kiện
router.get('/', eventController.getAll);

// Tạo sự kiện mới
router.post('/', eventController.create);

// Sửa sự kiện
router.put('/:id', eventController.update);

// Xóa sự kiện
router.delete('/:id', eventController.delete);

// Duyệt / Từ chối (pending → approved)
router.patch('/:id/status', eventController.changeStatus);

module.exports = router;
