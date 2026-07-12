const db = require('../config/db');

const ReportModel = {
  async summary() {
    const [rows] = await db.execute(`
      SELECT
        COUNT(*) AS totalAssets,
        SUM(CASE WHEN lifecycle_status = 'Available' THEN 1 ELSE 0 END) AS assetsAvailable,
        SUM(CASE WHEN lifecycle_status = 'Allocated' THEN 1 ELSE 0 END) AS assetsAllocated,
        SUM(CASE WHEN lifecycle_status = 'Under Maintenance' THEN 1 ELSE 0 END) AS assetsUnderMaintenance,
        SUM(CASE WHEN lifecycle_status = 'Retired' THEN 1 ELSE 0 END) AS assetsRetired
      FROM assets
    `);
    return rows[0] || {};
  },

  async assetsUtilization() {
    const [rows] = await db.execute(`
      SELECT
        ac.category_name AS category,
        COUNT(a.id) AS totalAssets,
        SUM(CASE WHEN a.lifecycle_status = 'Available' THEN 1 ELSE 0 END) AS available,
        SUM(CASE WHEN a.lifecycle_status = 'Allocated' THEN 1 ELSE 0 END) AS allocated,
        SUM(CASE WHEN a.lifecycle_status = 'Under Maintenance' THEN 1 ELSE 0 END) AS underMaintenance
      FROM assets a
      LEFT JOIN asset_categories ac ON a.category_id = ac.id
      GROUP BY ac.category_name
      ORDER BY totalAssets DESC
    `);
    return rows;
  },

  async maintenanceFrequency() {
    const [rows] = await db.execute(`
      SELECT
        assets.asset_tag AS asset_code,
        assets.asset_name AS asset_name,
        COUNT(mr.id) AS maintenanceCount,
        MAX(mr.created_at) AS lastMaintenanceDate
      FROM maintenance_requests mr
      LEFT JOIN assets ON mr.asset_id = assets.id
      GROUP BY assets.id, assets.asset_tag, assets.asset_name
      ORDER BY maintenanceCount DESC
      LIMIT 50
    `);
    return rows;
  },

  async departmentSummary() {
    const [rows] = await db.execute(`
      SELECT
        d.id AS department_id,
        d.department_name AS department_name,
        COUNT(DISTINCT a.id) AS totalAssets,
        SUM(CASE WHEN a.lifecycle_status = 'Allocated' THEN 1 ELSE 0 END) AS allocatedAssets,
        SUM(CASE WHEN mr.maintenance_status = 'Pending' THEN 1 ELSE 0 END) AS pendingMaintenanceRequests
      FROM departments d
      LEFT JOIN assets a ON a.department_id = d.id
      LEFT JOIN maintenance_requests mr ON mr.asset_id = a.id
      GROUP BY d.id, d.department_name
      ORDER BY totalAssets DESC
    `);
    return rows;
  },

  async bookingHeatmap() {
    const [rows] = await db.execute(`
      SELECT
        DATE(start_time) AS booking_date,
        HOUR(start_time) AS booking_hour,
        COUNT(*) AS booking_count
      FROM resource_bookings
      WHERE booking_status IN ('Upcoming', 'Ongoing')
      GROUP BY DATE(start_time), HOUR(start_time)
      ORDER BY DATE(start_time) ASC, HOUR(start_time) ASC
      LIMIT 500
    `);
    return rows;
  },
};

module.exports = ReportModel;
