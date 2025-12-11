const express = require('express');
const router = express.Router();
const orgController = require('../controllers/organizationController');

router.get('/', orgController.getAll);
router.post('/', orgController.create);
router.put('/:id', orgController.update);
router.delete('/:id', orgController.delete);

module.exports = router;
