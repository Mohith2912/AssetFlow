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
      conditions.push('resource_bookings.asset_id = ?');
      values.push(filters.asset_id);
    }

    if (filters.user_id) {
      conditions.push('resource_bookings.booked_by_user_id = ?');
      values.push(filters.user_id);
    }

    if (filters.status) {
      conditions.push('resource_bookings.booking_status = ?');
      values.push(filters.status);
    }

    if (filters.start_date) {
      conditions.push('resource_bookings.start_time >= ?');
      values.push(filters.start_date);
    }

    const sql = `
      SELECT
        resource_bookings.id,
        resource_bookings.asset_id,
        assets.asset_tag AS asset_code,
        assets.asset_name AS asset_name,
        resource_bookings.booked_by_user_id AS user_id,
        users.full_name AS user_name,
        resource_bookings.start_time,
        resource_bookings.end_time,
        resource_bookings.booking_status AS status,
        resource_bookings.booking_purpose AS purpose,
        resource_bookings.created_at AS createdAt,
        resource_bookings.updated_at AS updatedAt
      FROM resource_bookings
      LEFT JOIN assets ON resource_bookings.asset_id = assets.id
      LEFT JOIN users ON resource_bookings.booked_by_user_id = users.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY resource_bookings.start_time ASC
    `;

    const [rows] = await db.execute(sql, values);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute(`
      SELECT
        resource_bookings.id,
        resource_bookings.asset_id,
        assets.asset_tag AS asset_code,
        assets.asset_name AS asset_name,
        resource_bookings.booked_by_user_id AS user_id,
        users.full_name AS user_name,
        resource_bookings.start_time,
        resource_bookings.end_time,
        resource_bookings.booking_status AS status,
        resource_bookings.booking_purpose AS purpose,
        resource_bookings.created_at AS createdAt,
        resource_bookings.updated_at AS updatedAt
      FROM resource_bookings
      LEFT JOIN assets ON resource_bookings.asset_id = assets.id
      LEFT JOIN users ON resource_bookings.booked_by_user_id = users.id
      WHERE resource_bookings.id = ?
    `, [id]);
    return rows[0];
  },

  async hasOverlap({ asset_id, start_time, end_time, excludeId }) {
    const params = [asset_id, end_time, start_time];
    let sql = `
      SELECT id
      FROM resource_bookings
      WHERE asset_id = ?
        AND booking_status NOT IN ('Cancelled', 'Completed')
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
      `INSERT INTO resource_bookings (asset_id, booked_by_user_id, booking_purpose, start_time, end_time, booking_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [asset_id, user_id, purpose || null, start_time, end_time, status]
    );
    return result.insertId;
  },

  async update(id, { asset_id, start_time, end_time, purpose, status }) {
    await db.execute(
      `UPDATE resource_bookings
       SET asset_id = ?, start_time = ?, end_time = ?, booking_purpose = ?, booking_status = ?, updated_at = NOW()
       WHERE id = ?`,
      [asset_id, start_time, end_time, purpose || null, status, id]
    );
  },

  async cancel(id) {
    await db.execute(
      `UPDATE resource_bookings SET booking_status = 'Cancelled', updated_at = NOW() WHERE id = ?`,
      [id]
    );
  },

  async logActivity({ user_id, action, details }) {
    await db.execute(
      'INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [user_id, action, 'Booking', 0, details]
    );
  },
};

module.exports = BookingModel;
