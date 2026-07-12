const db = require('../config/db');

function normalizeStatus(status) {
  const value = String(status || '').trim().toLowerCase();
  const map = {
    available: 'Available',
    allocated: 'Allocated',
    reserved: 'Reserved',
    under_maintenance: 'Under Maintenance',
    undermaintenance: 'Under Maintenance',
    underservice: 'Under Maintenance',
    lost: 'Lost',
    retired: 'Retired',
    disposed: 'Disposed',
    pending: 'Available',
  };
  return map[value] || status || 'Available';
}

const AssetModel = {
  async generateAssetCode() {
    const [rows] = await db.execute("SELECT asset_tag FROM assets WHERE asset_tag LIKE 'AF-%' ORDER BY id DESC LIMIT 1");
    if (rows.length === 0 || !rows[0].asset_tag) {
      return 'AF-0001';
    }

    const match = rows[0].asset_tag.match(/^AF-(\d+)$/i);
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
      conditions.push('assets.lifecycle_status = ?');
      values.push(normalizeStatus(filters.status));
    }

    if (filters.department_id) {
      conditions.push('assets.department_id = ?');
      values.push(filters.department_id);
    }

    if (filters.search) {
      const term = `%${filters.search}%`;
      conditions.push('(assets.asset_tag LIKE ? OR assets.asset_name LIKE ? OR assets.location LIKE ? OR assets.serial_number LIKE ?)');
      values.push(term, term, term, term);
    }

    const sql = `
      SELECT
        assets.id,
        assets.asset_tag AS asset_code,
        assets.asset_name AS name,
        assets.category_id,
        ac.category_name AS category,
        assets.department_id,
        departments.department_name AS department,
        assets.serial_number,
        assets.condition_status AS condition,
        assets.location,
        assets.lifecycle_status AS status,
        assets.is_bookable AS isBookable,
        assets.acquisition_date AS acquisitionDate,
        assets.acquisition_cost AS acquisitionCost,
        assets.created_at AS createdAt,
        assets.updated_at AS updatedAt
      FROM assets
      LEFT JOIN asset_categories ac ON assets.category_id = ac.id
      LEFT JOIN departments ON assets.department_id = departments.id
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
        assets.asset_tag AS asset_code,
        assets.asset_name AS name,
        assets.category_id,
        ac.category_name AS category,
        assets.department_id,
        departments.department_name AS department,
        assets.serial_number,
        assets.condition_status AS condition,
        assets.location,
        assets.lifecycle_status AS status,
        assets.is_bookable AS isBookable,
        assets.acquisition_date AS acquisitionDate,
        assets.acquisition_cost AS acquisitionCost,
        assets.created_at AS createdAt,
        assets.updated_at AS updatedAt
      FROM assets
      LEFT JOIN asset_categories ac ON assets.category_id = ac.id
      LEFT JOIN departments ON assets.department_id = departments.id
      WHERE assets.id = ?
    `, [id]);

    return rows[0];
  },

  async create(data) {
    const sql = `
      INSERT INTO assets
        (asset_tag, asset_name, category_id, department_id, serial_number, acquisition_date, acquisition_cost, condition_status, location, is_bookable, lifecycle_status, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await db.execute(sql, [
      data.asset_code,
      data.name,
      data.category_id,
      data.department_id || null,
      data.serial_number || null,
      data.acquisitionDate || null,
      data.acquisitionCost || null,
      data.condition || null,
      data.location || null,
      data.is_bookable ? 1 : 0,
      normalizeStatus(data.status),
      data.created_by || null,
    ]);

    return { id: result.insertId, ...data };
  },

  async update(id, data) {
    const sql = `
      UPDATE assets SET
        asset_tag = ?,
        asset_name = ?,
        category_id = ?,
        department_id = ?,
        serial_number = ?,
        acquisition_date = ?,
        acquisition_cost = ?,
        condition_status = ?,
        location = ?,
        is_bookable = ?,
        lifecycle_status = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    await db.execute(sql, [
      data.asset_code,
      data.name,
      data.category_id,
      data.department_id || null,
      data.serial_number || null,
      data.acquisitionDate || null,
      data.acquisitionCost || null,
      data.condition || null,
      data.location || null,
      data.is_bookable ? 1 : 0,
      normalizeStatus(data.status),
      id,
    ]);
  },

  async updateStatus(id, status) {
    await db.execute('UPDATE assets SET lifecycle_status = ?, updated_at = NOW() WHERE id = ?', [normalizeStatus(status), id]);
  },

  async categoryExists(categoryId) {
    const [rows] = await db.execute('SELECT id FROM asset_categories WHERE id = ?', [categoryId]);
    return rows.length > 0;
  },

  async existsByCode(assetCode) {
    const [rows] = await db.execute('SELECT id FROM assets WHERE asset_tag = ?', [assetCode]);
    return rows.length > 0;
  },
};

module.exports = AssetModel;
