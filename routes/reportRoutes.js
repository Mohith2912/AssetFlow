const express = require('express');
const reportController = require('../controllers/reportController');
const requireAuth = require('../middleware/requireAuth');
const requireRoles = require('../middleware/requireRoles');

const router = express.Router();
const allowedRoles = ['Admin', 'Asset Manager', 'Department Head'];

router.use(requireAuth, requireRoles(allowedRoles));
router.get('/summary', reportController.summary);
router.get('/assets-utilization', reportController.assetsUtilization);
router.get('/maintenance-frequency', reportController.maintenanceFrequency);
router.get('/department-summary', reportController.departmentSummary);
router.get('/booking-heatmap', reportController.bookingHeatmap);

module.exports = router;
