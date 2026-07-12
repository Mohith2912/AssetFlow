const Joi = require('joi');
const MaintenanceModel = require('../models/maintenanceModel');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const requestSchema = Joi.object({
  asset_id: Joi.number().integer().positive().required(),
  reason: Joi.string().trim().min(5).max(255).required(),
  notes: Joi.string().trim().optional().allow(null, ''),
});

const statusSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected', 'resolved', 'technician_assigned', 'in_progress').required(),
  technician_name: Joi.string().trim().optional().allow(null, ''),
});

const maintenanceController = {
  async request(req, res, next) {
    try {
      const { error, value } = requestSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      const asset = await MaintenanceModel.assetById(value.asset_id);
      if (!asset) {
        return errorResponse(res, 'Asset not found', null, 404);
      }

      const id = await MaintenanceModel.createRequest({
        asset_id: value.asset_id,
        requested_by: req.user.userId,
        reason: value.reason,
        notes: value.notes,
      });

      await MaintenanceModel.logActivity({
        user_id: req.user.userId,
        action: 'create_maintenance_request',
        details: `Requested maintenance for asset ${value.asset_id}`,
      });

      const request = await MaintenanceModel.findById(id);
      return successResponse(res, 'Maintenance request created', request, 201);
    } catch (err) {
      next(err);
    }
  },

  async list(req, res, next) {
    try {
      const filters = {
        status: req.query.status ? req.query.status.toLowerCase() : undefined,
        asset_id: req.query.asset_id ? Number(req.query.asset_id) : undefined,
        requested_by: req.query.requested_by ? Number(req.query.requested_by) : undefined,
      };

      const requests = await MaintenanceModel.findAll(filters);
      return successResponse(res, 'Maintenance requests retrieved successfully', requests);
    } catch (err) {
      next(err);
    }
  },

  async approve(req, res, next) {
    try {
      const { error, value } = statusSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      if (value.status !== 'approved') {
        return errorResponse(res, 'Invalid status for approval', null, 400);
      }

      const request = await MaintenanceModel.findById(req.params.id);
      if (!request) {
        return errorResponse(res, 'Maintenance request not found', null, 404);
      }

      if (request.status !== 'pending') {
        return errorResponse(res, 'Only pending requests can be approved', null, 409);
      }

      await MaintenanceModel.updateStatus(req.params.id, {
        status: 'approved',
        approved_by: req.user.userId,
        approved_at: new Date(),
      });
      await MaintenanceModel.updateAssetStatus(request.asset_id, 'under_maintenance');
      await MaintenanceModel.logActivity({
        user_id: req.user.userId,
        action: 'approve_maintenance',
        details: `Approved maintenance request ${req.params.id}`,
      });

      const updated = await MaintenanceModel.findById(req.params.id);
      return successResponse(res, 'Maintenance approved', updated);
    } catch (err) {
      next(err);
    }
  },

  async reject(req, res, next) {
    try {
      const { error, value } = statusSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      if (value.status !== 'rejected') {
        return errorResponse(res, 'Invalid status for rejection', null, 400);
      }

      const request = await MaintenanceModel.findById(req.params.id);
      if (!request) {
        return errorResponse(res, 'Maintenance request not found', null, 404);
      }

      if (request.status !== 'pending') {
        return errorResponse(res, 'Only pending requests can be rejected', null, 409);
      }

      await MaintenanceModel.updateStatus(req.params.id, {
        status: 'rejected',
        rejected_by: req.user.userId,
        rejected_at: new Date(),
      });
      await MaintenanceModel.logActivity({
        user_id: req.user.userId,
        action: 'reject_maintenance',
        details: `Rejected maintenance request ${req.params.id}`,
      });

      const updated = await MaintenanceModel.findById(req.params.id);
      return successResponse(res, 'Maintenance rejected', updated);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { error, value } = statusSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      const request = await MaintenanceModel.findById(req.params.id);
      if (!request) {
        return errorResponse(res, 'Maintenance request not found', null, 404);
      }

      const statusMap = {
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        resolved: 'Resolved',
        technician_assigned: 'Technician Assigned',
        in_progress: 'In Progress',
      };
      const normalizedStatus = statusMap[value.status] || value.status;

      const updates = { maintenance_status: normalizedStatus };
      if (normalizedStatus === 'Approved') {
        updates.approved_by = req.user.userId;
        updates.approved_at = new Date();
      } else if (normalizedStatus === 'Rejected') {
        updates.approved_by = req.user.userId;
        updates.approved_at = new Date();
      } else if (normalizedStatus === 'Resolved') {
        updates.resolved_at = new Date();
      }

      if (value.technician_name) {
        updates.technician_name = value.technician_name;
      }

      await MaintenanceModel.updateStatus(req.params.id, updates);
      if (normalizedStatus === 'Resolved') {
        await MaintenanceModel.updateAssetStatus(request.asset_id, 'Available');
      } else if (['Approved', 'Technician Assigned', 'In Progress'].includes(normalizedStatus)) {
        await MaintenanceModel.updateAssetStatus(request.asset_id, 'Under Maintenance');
      }
      await MaintenanceModel.logActivity({
        user_id: req.user.userId,
        action: 'update_maintenance_status',
        details: `Updated maintenance request ${req.params.id} to ${normalizedStatus}`,
      });

      const updated = await MaintenanceModel.findById(req.params.id);
      return successResponse(res, 'Maintenance status updated', updated);
    } catch (err) {
      next(err);
    }
  },

  async resolve(req, res, next) {
    try {
      const { error, value } = statusSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      if (value.status !== 'resolved') {
        return errorResponse(res, 'Invalid status for resolution', null, 400);
      }

      const request = await MaintenanceModel.findById(req.params.id);
      if (!request) {
        return errorResponse(res, 'Maintenance request not found', null, 404);
      }

      if (request.status !== 'approved') {
        return errorResponse(res, 'Only approved requests can be resolved', null, 409);
      }

      await MaintenanceModel.updateStatus(req.params.id, {
        maintenance_status: 'Resolved',
        resolved_at: new Date(),
      });
      await MaintenanceModel.updateAssetStatus(request.asset_id, 'Available');
      await MaintenanceModel.logActivity({
        user_id: req.user.userId,
        action: 'resolve_maintenance',
        details: `Resolved maintenance request ${req.params.id}`,
      });

      const updated = await MaintenanceModel.findById(req.params.id);
      return successResponse(res, 'Maintenance resolved', updated);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = maintenanceController;
