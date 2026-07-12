const express = require('express');
const assetController = require('../controllers/assetController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

const { errorResponse } = require('../utils/apiResponse');

function roleGuard(req, res, next) {
  if (req.user.role === 'Admin' || req.user.role === 'Asset Manager') {
    return next();
  }
  return errorResponse(res, 'Insufficient privileges', null, 403);
}

router.get('/', requireAuth, assetController.list);
router.get('/:id', requireAuth, assetController.getById);
router.post('/', requireAuth, roleGuard, assetController.create);
router.put('/:id', requireAuth, roleGuard, assetController.update);
router.patch('/:id/status', requireAuth, roleGuard, assetController.updateStatus);

module.exports = router;
