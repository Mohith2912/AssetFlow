const db = require('../config/db');

const AuditModel = {
  async findAll(filters = {}) {
    const conditions = ['1 = 1'];
    const values = [];

    if (filters.asset_id) {
      conditions.push('a.asset_id = ?');
      values.push(filters.asset_id);
    }

    if (filters.auditor_id) {
      conditions.push('a.auditor_id = ?');
      values.push(filters.auditor_id);
    }

    if (filters.start_date) {
      conditions.push('a.audit_date >= ?');
      values.push(filters.start_date);
    }

    if (filters.end_date) {
      conditions.push('a.audit_date <= ?');
      values.push(filters.end_date);
    }

    const sql = `
      SELECT
        a.id,
        a.asset_id,
        assets.asset_code,
        assets.name AS asset_name,
        a.auditor_id,
        auditor.name AS auditor_name,
        a.findings,
        a.notes,
        a.audit_date AS auditDate,
        a.created_at AS createdAt,
        a.updated_at AS updatedAt
      FROM audits a
      LEFT JOIN assets ON a.asset_id = assets.id
      LEFT JOIN users auditor ON a.auditor_id = auditor.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY a.audit_date DESC
      LIMIT ?
    `;

    values.push(filters.limit || 100);
    const [rows] = await db.execute(sql, values);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT
         a.id,
         a.asset_id,
         assets.asset_code,
         assets.name AS asset_name,
         a.auditor_id,
         auditor.name AS auditor_name,
         a.findings,
         a.notes,
         a.audit_date AS auditDate,
         a.created_at AS createdAt,
         a.updated_at AS updatedAt
       FROM audits a
       LEFT JOIN assets ON a.asset_id = assets.id
       LEFT JOIN users auditor ON a.auditor_id = auditor.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  },

  async create({ asset_id, auditor_id, findings, notes, audit_date }) {
    const [result] = await db.execute(
      `INSERT INTO audits (asset_id, auditor_id, findings, notes, audit_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [asset_id, auditor_id || null, findings || null, notes || null, audit_date || new Date()]
    );
    return result.insertId;
  },
};

module.exports = AuditModel;
