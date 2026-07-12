const Joi = require('joi');
const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const departmentSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  code: Joi.string().trim().min(2).max(20).required(),
});

const statusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive').required(),
});

const departmentController = {
  async getAll(req, res, next) {
    try {
      const [departments] = await db.execute('SELECT id, department_name AS name, department_name AS code, status, created_at AS createdAt, updated_at AS updatedAt FROM departments');
      return successResponse(res, 'Departments retrieved successfully', departments);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { error, value } = departmentSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      const [existing] = await db.execute('SELECT id FROM departments WHERE department_name = ?', [value.name]);
      if (existing.length > 0) {
        return errorResponse(res, 'Department code already exists', null, 409);
      }

      const [result] = await db.execute(
        'INSERT INTO departments (department_name, status, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [value.name, 'Active']
      );

      const [rows] = await db.execute('SELECT id, department_name AS name, department_name AS code, status, created_at AS createdAt, updated_at AS updatedAt FROM departments WHERE id = ?', [result.insertId]);
      return successResponse(res, 'Department created successfully', rows[0], 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { error, value } = departmentSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      const [existing] = await db.execute('SELECT id FROM departments WHERE id = ?', [id]);
      if (existing.length === 0) {
        return errorResponse(res, 'Department not found', null, 404);
      }

      const [codeConflict] = await db.execute('SELECT id FROM departments WHERE department_name = ? AND id <> ?', [value.name, id]);
      if (codeConflict.length > 0) {
        return errorResponse(res, 'Department code is already in use', null, 409);
      }

      await db.execute(
        'UPDATE departments SET department_name = ?, updated_at = NOW() WHERE id = ?',
        [value.name, id]
      );

      const [rows] = await db.execute('SELECT id, department_name AS name, department_name AS code, status, created_at AS createdAt, updated_at AS updatedAt FROM departments WHERE id = ?', [id]);
      return successResponse(res, 'Department updated successfully', rows[0]);
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

      const [existing] = await db.execute('SELECT id FROM departments WHERE id = ?', [id]);
      if (existing.length === 0) {
        return errorResponse(res, 'Department not found', null, 404);
      }

      await db.execute('UPDATE departments SET status = ?, updated_at = NOW() WHERE id = ?', [value.status, id]);
      const [rows] = await db.execute('SELECT id, department_name AS name, department_name AS code, status, created_at AS createdAt, updated_at AS updatedAt FROM departments WHERE id = ?', [id]);
      return successResponse(res, 'Department status updated successfully', rows[0]);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = departmentController;
