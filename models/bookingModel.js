const db = require('../config/db');

const BookingModel = {
  async assetById(assetId) {
    const [rows] = await db.execute('SELECT id FROM assets WHERE id = ?', [assetId]);
    return rows[0];
  },

  async userById(userId) {
    const [rows] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
    return rows[0];
  },

  async findAll(filters = {}) {
    const conditions = ['1 = 1'];
    const values = [];

    if (filters.asset_id) {
      conditions.push('bookings.asset_id = ?');
      values.push(filters.asset_id);
    }

    if (filters.user_id) {
      conditions.push('bookings.user_id = ?');
      values.push(filters.user_id);
    }

    if (filters.status) {
      conditions.push('bookings.status = ?');
      values.push(filters.status);
    }

    if (filters.start_date) {
      conditions.push('bookings.start_time >= ?');
      values.push(filters.start_date);
    }

    const sql = `
      SELECT
        bookings.id,
        bookings.asset_id,
        assets.asset_code,
        assets.name AS asset_name,
        bookings.user_id,
        users.name AS user_name,
        bookings.start_time,
        bookings.end_time,
        bookings.status,
        bookings.purpose,
        bookings.created_at AS createdAt,
        bookings.updated_at AS updatedAt
      FROM bookings
      LEFT JOIN assets ON bookings.asset_id = assets.id
      LEFT JOIN users ON bookings.user_id = users.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY bookings.start_time ASC
    `;

    const [rows] = await db.execute(sql, values);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute(`
      SELECT
        bookings.id,
        bookings.asset_id,
        assets.asset_code,
        assets.name AS asset_name,
        bookings.user_id,
        users.name AS user_name,
        bookings.start_time,
        bookings.end_time,
        bookings.status,
        bookings.purpose,
        bookings.created_at AS createdAt,
        bookings.updated_at AS updatedAt
      FROM bookings
      LEFT JOIN assets ON bookings.asset_id = assets.id
      LEFT JOIN users ON bookings.user_id = users.id
      WHERE bookings.id = ?
    `, [id]);
    return rows[0];
  },

  async hasOverlap({ asset_id, start_time, end_time, excludeId }) {
    const params = [asset_id, end_time, start_time];
    let sql = `
      SELECT id
      FROM bookings
      WHERE asset_id = ?
        AND status NOT IN ('cancelled', 'rejected', 'completed')
        AND NOT (end_time <= ? OR start_time >= ?)
    `;

    if (excludeId) {
      sql += ' AND id <> ?';
      params.push(excludeId);
    }

    const [rows] = await db.execute(sql, params);
    return rows.length > 0;
  },

  async create({ asset_id, user_id, start_time, end_time, purpose, status }) {
    const [result] = await db.execute(
      `INSERT INTO bookings (asset_id, user_id, start_time, end_time, purpose, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [asset_id, user_id, start_time, end_time, purpose || null, status]
    );
    return result.insertId;
  },

  async update(id, { asset_id, start_time, end_time, purpose, status }) {
    await db.execute(
      `UPDATE bookings
       SET asset_id = ?, start_time = ?, end_time = ?, purpose = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [asset_id, start_time, end_time, purpose || null, status, id]
    );
  },

  async cancel(id) {
    await db.execute(
      `UPDATE bookings SET status = 'cancelled', updated_at = NOW() WHERE id = ?`,
      [id]
    );
  },

  async logActivity({ user_id, action, details }) {
    await db.execute(
      'INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())',
      [user_id, action, details]
    );
  },
};

module.exports = BookingModel;
