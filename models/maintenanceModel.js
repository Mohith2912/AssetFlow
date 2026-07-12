const db = require('../config/db');

const MaintenanceModel = {
  async assetById(assetId) {
    const [rows] = await db.execute('SELECT id, status FROM assets WHERE id = ?', [assetId]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.execute(`
      SELECT
        mr.*,
        assets.asset_code,
        assets.name AS asset_name,
        requester.name AS requested_by_name,
        approver.name AS approved_by_name,
        rejecter.name AS rejected_by_name,
        resolver.name AS resolved_by_name
      FROM maintenance_requests mr
      LEFT JOIN assets ON mr.asset_id = assets.id
      LEFT JOIN users requester ON mr.requested_by = requester.id
      LEFT JOIN users approver ON mr.approved_by = approver.id
      LEFT JOIN users rejecter ON mr.rejected_by = rejecter.id
      LEFT JOIN users resolver ON mr.resolved_by = resolver.id
      WHERE mr.id = ?
    `, [id]);
    return rows[0];
  },

  async findAll(filters = {}) {
    const conditions = ['1 = 1'];
    const values = [];

    if (filters.status) {
      conditions.push('mr.status = ?');
      values.push(filters.status);
    }

    if (filters.asset_id) {
      conditions.push('mr.asset_id = ?');
      values.push(filters.asset_id);
    }

    if (filters.requested_by) {
      conditions.push('mr.requested_by = ?');
      values.push(filters.requested_by);
    }

    const sql = `
      SELECT
        mr.*,
        assets.asset_code,
        assets.name AS asset_name,
        requester.name AS requested_by_name
      FROM maintenance_requests mr
      LEFT JOIN assets ON mr.asset_id = assets.id
      LEFT JOIN users requester ON mr.requested_by = requester.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY mr.created_at DESC
    `;

    const [rows] = await db.execute(sql, values);
    return rows;
  },

  async createRequest({ asset_id, requested_by, reason, notes }) {
    const [result] = await db.execute(
      `INSERT INTO maintenance_requests
        (asset_id, requested_by, reason, notes, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [asset_id, requested_by, reason, notes || null]
    );
    return result.insertId;
  },

  async updateStatus(id, updates) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    fields.push('updated_at = NOW()');
    const sql = `UPDATE maintenance_requests SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    await db.execute(sql, values);
  },

  async updateAssetStatus(assetId, status) {
    await db.execute('UPDATE assets SET status = ?, updated_at = NOW() WHERE id = ?', [status, assetId]);
  },

  async logActivity({ user_id, action, details }) {
    await db.execute(
      'INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())',
      [user_id, action, details]
    );
  },
};

module.exports = MaintenanceModel;
