const express = require('express');
const employeeController = require('../controllers/employeeController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.get('/', requireAuth, employeeController.list);
router.post('/promote', requireAuth, requireRole('Admin'), employeeController.promote);
router.patch('/:id/status', requireAuth, requireRole('Admin'), employeeController.updateStatus);

module.exports = router;
