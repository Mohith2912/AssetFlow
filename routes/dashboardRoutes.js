const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireRoles = require('../middleware/requireRoles');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();
const allowedRoles = ['Admin', 'Asset Manager', 'Department Head'];

router.get('/stats', requireAuth, requireRoles(allowedRoles), dashboardController.stats);
router.get('/summary', requireAuth, requireRoles(allowedRoles), dashboardController.summary);

module.exports = router;
