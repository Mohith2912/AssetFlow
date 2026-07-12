const Joi = require('joi');
const ActivityLogModel = require('../models/activityLogModel');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const createSchema = Joi.object({
  action: Joi.string().trim().min(3).max(100).required(),
  details: Joi.string().trim().min(3).max(500).required(),
  user_id: Joi.number().integer().positive().optional(),
});

const rolesAllowed = ['Admin', 'Asset Manager', 'Department Head'];

const activityLogController = {
  async list(req, res, next) {
    try {
      if (!rolesAllowed.includes(req.user.role)) {
        return errorResponse(res, 'Insufficient privileges to view logs', null, 403);
      }

      const filters = {
        user_id: req.query.user_id ? Number(req.query.user_id) : undefined,
        action: req.query.action ? String(req.query.action).trim() : undefined,
        start_date: req.query.start_date ? String(req.query.start_date) : undefined,
        end_date: req.query.end_date ? String(req.query.end_date) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : 100,
      };

      const logs = await ActivityLogModel.findAll(filters);
      return successResponse(res, 'Activity logs retrieved successfully', logs);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { error, value } = createSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      const userId = value.user_id || req.user.userId;
      const logId = await ActivityLogModel.create({ user_id: userId, action: value.action, details: value.details });
      return successResponse(res, 'Activity log created successfully', { id: logId }, 201);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = activityLogController;
