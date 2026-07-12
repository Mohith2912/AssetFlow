const express = require('express');
const activityLogController = require('../controllers/activityLogController');
const requireAuth = require('../middleware/requireAuth');
const requireRoles = require('../middleware/requireRoles');

const router = express.Router();
const allowedRoles = ['Admin', 'Asset Manager', 'Department Head'];

router.get('/', requireAuth, requireRoles(allowedRoles), activityLogController.list);
router.post('/', requireAuth, activityLogController.create);

module.exports = router;
