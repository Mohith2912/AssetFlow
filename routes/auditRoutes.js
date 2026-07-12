const express = require('express');
const auditController = require('../controllers/auditController');
const requireAuth = require('../middleware/requireAuth');
const requireRoles = require('../middleware/requireRoles');

const router = express.Router();
const allowedRoles = ['Admin', 'Asset Manager', 'Department Head'];

router.get('/', requireAuth, requireRoles(allowedRoles), auditController.list);
router.get('/:id', requireAuth, requireRoles(allowedRoles), auditController.getById);
router.post('/', requireAuth, requireRoles(allowedRoles), auditController.create);

module.exports = router;
