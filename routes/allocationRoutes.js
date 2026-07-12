const express = require('express');
const allocationController = require('../controllers/allocationController');
const requireAuth = require('../middleware/requireAuth');
const requireRoles = require('../middleware/requireRoles');

const router = express.Router();
const allocationRoles = ['Admin', 'Asset Manager'];
const approvalRoles = ['Admin', 'Asset Manager', 'Department Head'];

router.post('/', requireAuth, requireRoles(allocationRoles), allocationController.allocate);
router.post('/return', requireAuth, allocationController.returnAsset);
router.post('/transfer-request', requireAuth, allocationController.transferRequest);
router.post('/transfer-approve', requireAuth, requireRoles(approvalRoles), allocationController.transferApprove);

module.exports = router;
