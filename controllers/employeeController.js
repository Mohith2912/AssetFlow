const Joi = require('joi');
const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const promoteSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  roleId: Joi.number().integer().positive().required(),
});

const statusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive').required(),
});

const employeeController = {
  async list(req, res, next) {
    try {
      const [rows] = await db.execute(`
        SELECT
          u.id,
          u.name,
          u.email,
          r.name AS role,
          d.name AS department,
          u.status,
          u.created_at AS createdAt,
          u.updated_at AS updatedAt
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN departments d ON u.department_id = d.id
        ORDER BY u.name ASC
      `);

      return successResponse(res, 'Employees retrieved successfully', rows);
    } catch (err) {
      next(err);
    }
  },

  async promote(req, res, next) {
    try {
      const { error, value } = promoteSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      const [userRows] = await db.execute('SELECT id FROM users WHERE id = ?', [value.userId]);
      if (userRows.length === 0) {
        return errorResponse(res, 'User not found', null, 404);
      }

      const [roleRows] = await db.execute('SELECT id, name FROM roles WHERE id = ?', [value.roleId]);
      if (roleRows.length === 0) {
        return errorResponse(res, 'Role not found', null, 404);
      }

      await db.execute('UPDATE users SET role_id = ?, updated_at = NOW() WHERE id = ?', [value.roleId, value.userId]);

      const [updatedRows] = await db.execute(`
        SELECT u.id, u.name, u.email, r.name AS role, d.name AS department, u.status, u.created_at AS createdAt, u.updated_at AS updatedAt
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE u.id = ?
      `, [value.userId]);

      return successResponse(res, 'User promoted successfully', updatedRows[0]);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = statusSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      const [userRows] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
      if (userRows.length === 0) {
        return errorResponse(res, 'User not found', null, 404);
      }

      await db.execute('UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?', [value.status, id]);

      const [updatedRows] = await db.execute(`
        SELECT u.id, u.name, u.email, r.name AS role, d.name AS department, u.status, u.created_at AS createdAt, u.updated_at AS updatedAt
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN departments d ON u.department_id = d.id
        WHERE u.id = ?
      `, [id]);

      return successResponse(res, 'Employee status updated successfully', updatedRows[0]);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = employeeController;
