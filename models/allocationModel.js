const db = require('../config/db');

const AllocationModel = {
  async assetById(assetId) {
    const [rows] = await db.execute('SELECT id, lifecycle_status AS status FROM assets WHERE id = ?', [assetId]);
    return rows[0];
  },

  async userById(userId) {
    const [rows] = await db.execute('SELECT id, role_id, department_id FROM users WHERE id = ?', [userId]);
    return rows[0];
  },

  async activeAllocationByAsset(assetId) {
    const [rows] = await db.execute(
      `SELECT * FROM asset_allocations WHERE asset_id = ? AND allocation_status IN ('Active', 'Transferred') ORDER BY created_at DESC LIMIT 1`,
      [assetId]
    );
    return rows[0];
  },

  async createAllocation({ asset_id, user_id, assigned_by, expected_return_date }) {
    const [result] = await db.execute(
      `INSERT INTO asset_allocations (asset_id, allocated_to_user_id, allocated_by, allocation_status, expected_return_date, created_at, updated_at)
       VALUES (?, ?, ?, 'Active', ?, NOW(), NOW())`,
      [asset_id, user_id, assigned_by, expected_return_date]
    );
    return result.insertId;
  },

  async createActivityLog({ user_id, action, details }) {
    await db.execute(
      'INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [user_id, action, 'Allocation', 0, details]
    );
  },

  async updateAssetStatus(assetId, status) {
    await db.execute('UPDATE assets SET lifecycle_status = ?, updated_at = NOW() WHERE id = ?', [status, assetId]);
  },

  async allocationById(id) {
    const [rows] = await db.execute(
      `SELECT
         a.id,
         a.asset_id,
         a.allocated_to_user_id AS user_id,
         a.allocated_by AS assigned_by,
         a.expected_return_date,
         a.actual_return_date,
         a.allocation_status AS status,
         assets.asset_tag AS asset_code,
         assets.asset_name AS asset_name,
         assets.lifecycle_status AS asset_status,
         u.full_name AS user_name,
         u.email AS user_email,
         u.department_id AS user_department_id,
         tr.full_name AS transfer_to_name,
         tr.email AS transfer_to_email
       FROM asset_allocations a
       LEFT JOIN assets ON a.asset_id = assets.id
       LEFT JOIN users u ON a.allocated_to_user_id = u.id
       LEFT JOIN users tr ON a.allocated_to_user_id = tr.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  },

  async markReturned(allocationId) {
    await db.execute(
      `UPDATE asset_allocations SET allocation_status = 'Returned', actual_return_date = NOW(), updated_at = NOW() WHERE id = ?`,
      [allocationId]
    );
  },

  async listTransfers() {
    const [rows] = await db.execute(`
      SELECT
        tr.id,
        tr.asset_id,
        assets.asset_tag AS asset_code,
        assets.asset_name AS asset_name,
        current_holder.full_name AS fromEmployee,
        target_user.full_name AS toEmployee,
        requester.full_name AS requestedBy,
        tr.request_status AS status,
        tr.requested_at AS requestedDate
      FROM transfer_requests tr
      LEFT JOIN assets ON tr.asset_id = assets.id
      LEFT JOIN users current_holder ON tr.current_holder_user_id = current_holder.id
      LEFT JOIN users requester ON tr.requested_by_user_id = requester.id
      LEFT JOIN users target_user ON tr.target_user_id = target_user.id
      ORDER BY tr.requested_at DESC
    `);
    return rows;
  },

  async transferRequest({ allocationId, transfer_to_user_id, requested_by }) {
    await db.execute(
      `INSERT INTO transfer_requests (asset_id, current_holder_user_id, requested_by_user_id, target_user_id, request_status, reason, requested_at)
       SELECT asset_id, allocated_to_user_id, ?, ?, 'Requested', 'Transfer requested via AssetFlow', NOW()
       FROM asset_allocations WHERE id = ?`,
      [requested_by, transfer_to_user_id, allocationId]
    );
    await db.execute(`UPDATE asset_allocations SET allocation_status = 'Transferred', updated_at = NOW() WHERE id = ?`, [allocationId]);
  },

  async approveTransfer({ allocationId, approverId }) {
    await db.execute(
      `UPDATE transfer_requests tr
       JOIN asset_allocations a ON a.id = ?
       SET tr.request_status = 'Approved', tr.approved_by = ?, tr.approved_at = NOW(), a.allocated_to_user_id = tr.target_user_id, a.allocation_status = 'Active', a.updated_at = NOW()
       WHERE tr.asset_id = a.asset_id AND tr.request_status = 'Requested'`,
      [allocationId, approverId]
    );
  },
};

module.exports = AllocationModel;
