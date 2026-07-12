const db = require('../config/db');

const ReportModel = {
  async summary() {
    const [rows] = await db.execute(`
      SELECT
        COUNT(*) AS totalAssets,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS assetsAvailable,
        SUM(CASE WHEN status = 'allocated' THEN 1 ELSE 0 END) AS assetsAllocated,
        SUM(CASE WHEN status = 'under_maintenance' THEN 1 ELSE 0 END) AS assetsUnderMaintenance,
        SUM(CASE WHEN status = 'retired' THEN 1 ELSE 0 END) AS assetsRetired
      FROM assets
    `);
    return rows[0] || {};
  },

  async assetsUtilization() {
    const [rows] = await db.execute(`
      SELECT
        ac.name AS category,
        COUNT(a.id) AS totalAssets,
        SUM(CASE WHEN a.status = 'available' THEN 1 ELSE 0 END) AS available,
        SUM(CASE WHEN a.status = 'allocated' THEN 1 ELSE 0 END) AS allocated,
        SUM(CASE WHEN a.status = 'under_maintenance' THEN 1 ELSE 0 END) AS underMaintenance
      FROM assets a
      LEFT JOIN asset_categories ac ON a.category_id = ac.id
      GROUP BY ac.name
      ORDER BY totalAssets DESC
    `);
    return rows;
  },

  async maintenanceFrequency() {
    const [rows] = await db.execute(`
      SELECT
        assets.asset_code,
        assets.name AS asset_name,
        COUNT(mr.id) AS maintenanceCount,
        MAX(mr.created_at) AS lastMaintenanceDate
      FROM maintenance_requests mr
      LEFT JOIN assets ON mr.asset_id = assets.id
      GROUP BY assets.id, assets.asset_code, assets.name
      ORDER BY maintenanceCount DESC
      LIMIT 50
    `);
    return rows;
  },

  async departmentSummary() {
    const [rows] = await db.execute(`
      SELECT
        d.id AS department_id,
        d.name AS department_name,
        COUNT(DISTINCT a.id) AS totalAssets,
        SUM(CASE WHEN a.status = 'allocated' THEN 1 ELSE 0 END) AS allocatedAssets,
        SUM(CASE WHEN ar.status = 'pending' THEN 1 ELSE 0 END) AS pendingMaintenanceRequests
      FROM departments d
      LEFT JOIN assets a ON a.department_id = d.id
      LEFT JOIN maintenance_requests ar ON ar.asset_id = a.id
      GROUP BY d.id, d.name
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
      FROM bookings
      WHERE status IN ('approved', 'completed', 'pending')
      GROUP BY DATE(start_time), HOUR(start_time)
      ORDER BY DATE(start_time) ASC, HOUR(start_time) ASC
      LIMIT 500
    `);
    return rows;
  },
};

module.exports = ReportModel;
