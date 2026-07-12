const db = require('../config/db');

const DashboardModel = {
  async getAssetSummary() {
    const [rows] = await db.execute(`
      SELECT
        SUM(CASE WHEN lifecycle_status = 'Available' THEN 1 ELSE 0 END) AS assetsAvailable,
        SUM(CASE WHEN lifecycle_status = 'Allocated' THEN 1 ELSE 0 END) AS assetsAllocated,
        SUM(CASE WHEN lifecycle_status = 'Under Maintenance' THEN 1 ELSE 0 END) AS assetsUnderMaintenance
      FROM assets
    `);
    return rows[0] || {};
  },

  async getBookingSummary() {
    const [rows] = await db.execute(`
      SELECT
        SUM(CASE WHEN booking_status IN ('Upcoming', 'Ongoing') THEN 1 ELSE 0 END) AS activeBookings,
        SUM(CASE WHEN booking_status = 'Completed' THEN 1 ELSE 0 END) AS completedBookings
      FROM resource_bookings
    `);
    return rows[0] || {};
  },

  async getAllocationSummary() {
    const [rows] = await db.execute(`
      SELECT
        SUM(CASE WHEN allocation_status = 'Active' AND expected_return_date < NOW() THEN 1 ELSE 0 END) AS overdueReturns,
        SUM(CASE WHEN allocation_status = 'Transferred' THEN 1 ELSE 0 END) AS pendingTransfers
      FROM asset_allocations
    `);
    return rows[0] || {};
  },

  async getMaintenanceSummary() {
    const [rows] = await db.execute(`
      SELECT
        SUM(CASE WHEN maintenance_status = 'Pending' THEN 1 ELSE 0 END) AS pendingMaintenance
      FROM maintenance_requests
    `);
    return rows[0] || {};
  },
};

module.exports = DashboardModel;
