const db = require('../config/db');

const ActivityLogModel = {
  async findAll(filters = {}) {
    const conditions = ['1 = 1'];
    const values = [];

    if (filters.user_id) {
      conditions.push('activity_logs.user_id = ?');
      values.push(filters.user_id);
    }

    if (filters.action) {
      conditions.push('activity_logs.action = ?');
      values.push(filters.action);
    }

    if (filters.start_date) {
      conditions.push('activity_logs.created_at >= ?');
      values.push(filters.start_date);
    }

    if (filters.end_date) {
      conditions.push('activity_logs.created_at <= ?');
      values.push(filters.end_date);
    }

    const sql = `
      SELECT
        activity_logs.id,
        activity_logs.user_id,
        users.name AS user_name,
        activity_logs.action,
        activity_logs.details,
        activity_logs.created_at AS createdAt
      FROM activity_logs
      LEFT JOIN users ON activity_logs.user_id = users.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY activity_logs.created_at DESC
      LIMIT ?
    `;

    values.push(filters.limit || 100);

    const [rows] = await db.execute(sql, values);
    return rows;
  },

  async create({ user_id, action, details }) {
    const [result] = await db.execute(
      'INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())',
      [user_id || null, action, details]
    );
    return result.insertId;
  },
};

module.exports = ActivityLogModel;
