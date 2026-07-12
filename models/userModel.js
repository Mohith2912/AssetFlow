const db = require('../config/db');

const User = {
  async create({ name, email, password, roleId = null, role = 'Employee', status = 'active' }) {
    if (!roleId) {
      const [roleRows] = await db.execute('SELECT id FROM roles WHERE name = ? LIMIT 1', [role]);
      roleId = roleRows[0] ? roleRows[0].id : null;
    }

    const query = 'INSERT INTO users (name, email, password, role_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())';
    const [result] = await db.execute(query, [name, email, password, roleId, status]);
    return { id: result.insertId, name, email, role, status };
  },

  async findByEmail(email) {
    const [rows] = await db.execute(
      `SELECT u.id, u.name, u.email, u.password, u.status, r.name AS role, u.role_id
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.email = ?`,
      [email]
    );
    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT u.id, u.name, u.email, u.status, r.name AS role, u.role_id
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [id]
    );
    return rows[0];
  }
};

module.exports = User;
