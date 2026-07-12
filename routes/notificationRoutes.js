const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const db = require('../config/db');
const { successResponse } = require('../utils/apiResponse');

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        id,
        title,
        message,
        notification_type AS type,
        is_read AS isRead,
        created_at AS createdAt
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user?.userId]);
    return successResponse(res, 'Notifications retrieved successfully', rows);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    await db.execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user?.userId]);
    return successResponse(res, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
