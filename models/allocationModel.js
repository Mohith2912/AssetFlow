const db = require('../config/db');

const AllocationModel = {
  async assetById(assetId) {
    const [rows] = await db.execute('SELECT id, status FROM assets WHERE id = ?', [assetId]);
    return rows[0];
  },

  async userById(userId) {
    const [rows] = await db.execute('SELECT id, role_id, department_id FROM users WHERE id = ?', [userId]);
    return rows[0];
  },

  async activeAllocationByAsset(assetId) {
    const [rows] = await db.execute(
      `SELECT * FROM allocations WHERE asset_id = ? AND status IN ('allocated', 'transfer_requested') ORDER BY created_at DESC LIMIT 1`,
      [assetId]
    );
    return rows[0];
  },

  async createAllocation({ asset_id, user_id, assigned_by, expected_return_date }) {
    const [result] = await db.execute(
      `INSERT INTO allocations (asset_id, user_id, assigned_by, status, expected_return_date, created_at, updated_at)
       VALUES (?, ?, ?, 'allocated', ?, NOW(), NOW())`,
      [asset_id, user_id, assigned_by, expected_return_date]
    );
    return result.insertId;
  },

  async createActivityLog({ user_id, action, details }) {
    await db.execute(
      'INSERT INTO activity_logs (user_id, action, details, created_at) VALUES (?, ?, ?, NOW())',
      [user_id, action, details]
    );
  },

  async updateAssetStatus(assetId, status) {
    await db.execute('UPDATE assets SET status = ?, updated_at = NOW() WHERE id = ?', [status, assetId]);
  },

  async allocationById(id) {
    const [rows] = await db.execute(
      `SELECT
         a.*, 
         assets.asset_code,
         assets.name AS asset_name,
         assets.status AS asset_status,
         u.name AS user_name,
         u.email AS user_email,
         u.department_id AS user_department_id,
         tr.name AS transfer_to_name,
         tr.email AS transfer_to_email
       FROM allocations a
       LEFT JOIN assets ON a.asset_id = assets.id
       LEFT JOIN users u ON a.user_id = u.id
       LEFT JOIN users tr ON a.transfer_to_user_id = tr.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  },

  async markReturned(allocationId) {
    await db.execute(
      `UPDATE allocations SET status = 'returned', return_date = NOW(), updated_at = NOW() WHERE id = ?`,
      [allocationId]
    );
  },

  async transferRequest({ allocationId, transfer_to_user_id, requested_by }) {
    await db.execute(
      `UPDATE allocations
       SET transfer_to_user_id = ?, transfer_status = 'pending', status = 'transfer_requested', updated_at = NOW()
       WHERE id = ?`,
      [transfer_to_user_id, allocationId]
    );
  },

  async approveTransfer({ allocationId, approverId }) {
    await db.execute(
      `UPDATE allocations
       SET user_id = transfer_to_user_id,
           transfer_status = 'approved',
           status = 'allocated',
           transfer_approved_by = ?,
           transfer_approved_at = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [approverId, allocationId]
    );
  },
};

module.exports = AllocationModel;
