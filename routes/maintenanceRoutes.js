const express = require('express');
const maintenanceController = require('../controllers/maintenanceController');
const requireAuth = require('../middleware/requireAuth');
const requireRoles = require('../middleware/requireRoles');

const router = express.Router();
const approverRoles = ['Admin', 'Asset Manager', 'Department Head'];

router.post('/', requireAuth, maintenanceController.request);
router.get('/', requireAuth, maintenanceController.list);
router.patch('/:id/status', requireAuth, maintenanceController.updateStatus);
router.patch('/:id/approve', requireAuth, requireRoles(approverRoles), maintenanceController.approve);
router.patch('/:id/reject', requireAuth, requireRoles(approverRoles), maintenanceController.reject);
router.patch('/:id/resolve', requireAuth, requireRoles(approverRoles), maintenanceController.resolve);

module.exports = router;
