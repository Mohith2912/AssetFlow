const db = require('../config/db');

const DashboardModel = {
  async getAssetSummary() {
    const [rows] = await db.execute(`
      SELECT
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS assetsAvailable,
        SUM(CASE WHEN status = 'allocated' THEN 1 ELSE 0 END) AS assetsAllocated,
        SUM(CASE WHEN status = 'under_maintenance' THEN 1 ELSE 0 END) AS assetsUnderMaintenance
      FROM assets
    `);
    return rows[0] || {};
  },

  async getBookingSummary() {
    const [rows] = await db.execute(`
      SELECT
        SUM(CASE WHEN status IN ('pending', 'approved') THEN 1 ELSE 0 END) AS activeBookings,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedBookings
      FROM bookings
    `);
    return rows[0] || {};
  },

  async getAllocationSummary() {
    const [rows] = await db.execute(`
      SELECT
        SUM(CASE WHEN status = 'allocated' AND expected_return_date < NOW() THEN 1 ELSE 0 END) AS overdueReturns,
        SUM(CASE WHEN status = 'transfer_requested' THEN 1 ELSE 0 END) AS pendingTransfers
      FROM allocations
    `);
    return rows[0] || {};
  },

  async getMaintenanceSummary() {
    const [rows] = await db.execute(`
      SELECT
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingMaintenance
      FROM maintenance_requests
    `);
    return rows[0] || {};
  },
};

module.exports = DashboardModel;
