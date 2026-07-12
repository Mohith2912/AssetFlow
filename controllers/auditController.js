const Joi = require('joi');
const AuditModel = require('../models/auditModel');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const auditSchema = Joi.object({
  asset_id: Joi.number().integer().positive().required(),
  auditor_id: Joi.number().integer().positive().optional().allow(null),
  findings: Joi.string().trim().min(3).max(1000).required(),
  notes: Joi.string().trim().optional().allow(null, ''),
  audit_date: Joi.date().iso().optional(),
});

const auditController = {
  async list(req, res, next) {
    try {
      const filters = {
        asset_id: req.query.asset_id ? Number(req.query.asset_id) : undefined,
        auditor_id: req.query.auditor_id ? Number(req.query.auditor_id) : undefined,
        start_date: req.query.start_date ? req.query.start_date : undefined,
        end_date: req.query.end_date ? req.query.end_date : undefined,
        limit: req.query.limit ? Number(req.query.limit) : 100,
      };

      const audits = await AuditModel.findAll(filters);
      return successResponse(res, 'Audits retrieved successfully', audits);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const audit = await AuditModel.findById(req.params.id);
      if (!audit) {
        return errorResponse(res, 'Audit record not found', null, 404);
      }
      return successResponse(res, 'Audit record retrieved successfully', audit);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { error, value } = auditSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      const id = await AuditModel.create({
        asset_id: value.asset_id,
        auditor_id: value.auditor_id || req.user.userId,
        findings: value.findings,
        notes: value.notes,
        audit_date: value.audit_date,
      });

      const audit = await AuditModel.findById(id);
      return successResponse(res, 'Audit record created successfully', audit, 201);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = auditController;
