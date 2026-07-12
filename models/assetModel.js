const db = require('../config/db');

const AssetModel = {
  async generateAssetCode() {
    const [rows] = await db.execute("SELECT asset_code FROM assets WHERE asset_code LIKE 'AF-%' ORDER BY id DESC LIMIT 1");
    if (rows.length === 0 || !rows[0].asset_code) {
      return 'AF-0001';
    }

    const match = rows[0].asset_code.match(/^AF-(\d+)$/i);
    const nextNumber = match ? parseInt(match[1], 10) + 1 : 1;
    return `AF-${String(nextNumber).padStart(4, '0')}`;
  },

  async findAll(filters = {}) {
    const conditions = ['1 = 1'];
    const values = [];

    if (filters.category_id) {
      conditions.push('assets.category_id = ?');
      values.push(filters.category_id);
    }

    if (filters.status) {
      conditions.push('assets.status = ?');
      values.push(filters.status);
    }

    if (filters.department_id) {
      conditions.push('assets.department_id = ?');
      values.push(filters.department_id);
    }

    if (filters.search) {
      const term = `%${filters.search}%`;
      conditions.push('(assets.asset_code LIKE ? OR assets.name LIKE ? OR assets.location LIKE ? OR assets.serial_number LIKE ?)');
      values.push(term, term, term, term);
    }

    const sql = `
      SELECT
        assets.id,
        assets.asset_code,
        assets.name,
        assets.category_id,
        ac.name AS category,
        assets.department_id,
        assets.serial_number,
        assets.condition,
        assets.location,
        assets.status,
        assets.is_shared,
        assets.is_bookable,
        assets.created_at AS createdAt,
        assets.updated_at AS updatedAt
      FROM assets
      LEFT JOIN asset_categories ac ON assets.category_id = ac.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY assets.created_at DESC
    `;

    const [rows] = await db.execute(sql, values);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute(`
      SELECT
        assets.id,
        assets.asset_code,
        assets.name,
        assets.category_id,
        ac.name AS category,
        assets.department_id,
        assets.serial_number,
        assets.condition,
        assets.location,
        assets.status,
        assets.is_shared,
        assets.is_bookable,
        assets.created_at AS createdAt,
        assets.updated_at AS updatedAt
      FROM assets
      LEFT JOIN asset_categories ac ON assets.category_id = ac.id
      WHERE assets.id = ?
    `, [id]);

    return rows[0];
  },

  async create(data) {
    const sql = `
      INSERT INTO assets
        (asset_code, name, category_id, department_id, serial_number, condition, location, status, is_shared, is_bookable, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await db.execute(sql, [
      data.asset_code,
      data.name,
      data.category_id,
      data.department_id || null,
      data.serial_number || null,
      data.condition || null,
      data.location || null,
      data.status,
      data.is_shared ? 1 : 0,
      data.is_bookable ? 1 : 0,
    ]);

    return { id: result.insertId, ...data };
  },

  async update(id, data) {
    const sql = `
      UPDATE assets SET
        asset_code = ?,
        name = ?,
        category_id = ?,
        department_id = ?,
        serial_number = ?,
        condition = ?,
        location = ?,
        status = ?,
        is_shared = ?,
        is_bookable = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    await db.execute(sql, [
      data.asset_code,
      data.name,
      data.category_id,
      data.department_id || null,
      data.serial_number || null,
      data.condition || null,
      data.location || null,
      data.status,
      data.is_shared ? 1 : 0,
      data.is_bookable ? 1 : 0,
      id,
    ]);
  },

  async updateStatus(id, status) {
    await db.execute('UPDATE assets SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
  },

  async categoryExists(categoryId) {
    const [rows] = await db.execute('SELECT id FROM asset_categories WHERE id = ?', [categoryId]);
    return rows.length > 0;
  },

  async existsByCode(assetCode) {
    const [rows] = await db.execute('SELECT id FROM assets WHERE asset_code = ?', [assetCode]);
    return rows.length > 0;
  },
};

module.exports = AssetModel;
