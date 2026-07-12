const db = require('../config/db');

const MaintenanceModel = {
  async assetById(assetId) {
    const [rows] = await db.execute('SELECT id, lifecycle_status AS status FROM assets WHERE id = ?', [assetId]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.execute(`
      SELECT
        mr.id,
        mr.asset_id,
        mr.raised_by,
        mr.issue_description AS reason,
        mr.priority,
        mr.maintenance_status AS status,
        mr.approved_by,
        mr.technician_name AS technician,
        mr.resolution_notes AS notes,
        mr.created_at,
        mr.updated_at,
        assets.asset_tag AS asset_code,
        assets.asset_name AS asset_name,
        requester.full_name AS requested_by_name,
        approver.full_name AS approved_by_name
      FROM maintenance_requests mr
      LEFT JOIN assets ON mr.asset_id = assets.id
      LEFT JOIN users requester ON mr.raised_by = requester.id
      LEFT JOIN users approver ON mr.approved_by = approver.id
      WHERE mr.id = ?
    `, [id]);
    return rows[0];
  },

  async findAll(filters = {}) {
    const conditions = ['1 = 1'];
    const values = [];

    if (filters.status) {
      conditions.push('mr.maintenance_status = ?');
      values.push(filters.status);
    }

    if (filters.asset_id) {
      conditions.push('mr.asset_id = ?');
      values.push(filters.asset_id);
    }

    if (filters.requested_by) {
      conditions.push('mr.raised_by = ?');
      values.push(filters.requested_by);
    }

    const sql = `
      SELECT
        mr.id,
        mr.asset_id,
        mr.raised_by,
        mr.issue_description AS reason,
        mr.priority,
        mr.maintenance_status AS status,
        mr.technician_name AS technician,
        mr.created_at,
        mr.updated_at,
        assets.asset_tag AS asset_code,
        assets.asset_name AS asset_name,
        requester.full_name AS requested_by_name
      FROM maintenance_requests mr
      LEFT JOIN assets ON mr.asset_id = assets.id
      LEFT JOIN users requester ON mr.raised_by = requester.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY mr.created_at DESC
    `;

    const [rows] = await db.execute(sql, values);
    return rows;
  },

  async createRequest({ asset_id, requested_by, reason, notes }) {
    const [result] = await db.execute(
      `INSERT INTO maintenance_requests
        (asset_id, raised_by, issue_description, priority, maintenance_status, created_at, updated_at)
       VALUES (?, ?, ?, 'Medium', 'Pending', NOW(), NOW())`,
      [asset_id, requested_by, reason || notes || 'Maintenance requested']
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
    await db.execute('UPDATE assets SET lifecycle_status = ?, updated_at = NOW() WHERE id = ?', [status, assetId]);
  },

  async logActivity({ user_id, action, details }) {
    await db.execute(
      'INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [user_id, action, 'Maintenance', 0, details]
    );
  },
};

module.exports = MaintenanceModel;
