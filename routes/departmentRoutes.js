const express = require('express');
const departmentController = require('../controllers/departmentController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();
const adminOnly = [requireAuth, requireRole('Admin')];

router.get('/', adminOnly, departmentController.getAll);
router.post('/', adminOnly, departmentController.create);
router.put('/:id', adminOnly, departmentController.update);
router.patch('/:id/status', adminOnly, departmentController.updateStatus);

module.exports = router;
