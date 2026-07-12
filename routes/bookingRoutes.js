const express = require('express');
const bookingController = require('../controllers/bookingController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get('/', requireAuth, bookingController.list);
router.post('/', requireAuth, bookingController.create);
router.put('/:id', requireAuth, bookingController.update);
router.patch('/:id/cancel', requireAuth, bookingController.cancel);

module.exports = router;
