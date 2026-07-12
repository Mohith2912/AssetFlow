const Joi = require('joi');
const AllocationModel = require('../models/allocationModel');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const allocationSchema = Joi.object({
  asset_id: Joi.number().integer().positive().required(),
  user_id: Joi.number().integer().positive().required(),
  expected_return_date: Joi.date().iso().required(),
});

const returnSchema = Joi.object({
  allocation_id: Joi.number().integer().positive().required(),
});

const transferRequestSchema = Joi.object({
  allocation_id: Joi.number().integer().positive().required(),
  transfer_to_user_id: Joi.number().integer().positive().required(),
});

const transferApproveSchema = Joi.object({
  allocation_id: Joi.number().integer().positive().required(),
});

const allowedApprovers = ['Admin', 'Asset Manager', 'Department Head'];

function canApprove(role) {
  return allowedApprovers.includes(role);
}

const allocationController = {
  async allocate(req, res, next) {
    try {
      const { error, value } = allocationSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      const asset = await AllocationModel.assetById(value.asset_id);
      if (!asset) {
        return errorResponse(res, 'Asset not found', null, 404);
      }

      if (asset.status !== 'available') {
        return errorResponse(res, 'Asset is not available for allocation', null, 409);
      }

      const user = await AllocationModel.userById(value.user_id);
      if (!user) {
        return errorResponse(res, 'User not found', null, 404);
      }

      const activeAllocation = await AllocationModel.activeAllocationByAsset(value.asset_id);
      if (activeAllocation) {
        return errorResponse(res, 'Asset is already allocated or in transfer request', activeAllocation, 409);
      }

      const allocationId = await AllocationModel.createAllocation({
        asset_id: value.asset_id,
        user_id: value.user_id,
        assigned_by: req.user.userId,
        expected_return_date: value.expected_return_date,
      });

      await AllocationModel.updateAssetStatus(value.asset_id, 'allocated');
      await AllocationModel.createActivityLog({
        user_id: req.user.userId,
        action: 'allocate_asset',
        details: `Allocated asset ${value.asset_id} to user ${value.user_id}`,
      });

      const allocation = await AllocationModel.allocationById(allocationId);
      return successResponse(res, 'Allocation created successfully', allocation, 201);
    } catch (err) {
      next(err);
    }
  },

  async returnAsset(req, res, next) {
    try {
      const { error, value } = returnSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      const allocation = await AllocationModel.allocationById(value.allocation_id);
      if (!allocation) {
        return errorResponse(res, 'Allocation not found', null, 404);
      }

      if (allocation.status !== 'allocated') {
        return errorResponse(res, 'Allocation is not active', null, 409);
      }

      await AllocationModel.markReturned(value.allocation_id);
      await AllocationModel.updateAssetStatus(allocation.asset_id, 'available');
      await AllocationModel.createActivityLog({
        user_id: req.user.userId,
        action: 'return_asset',
        details: `Asset ${allocation.asset_id} returned from user ${allocation.user_id}`,
      });

      return successResponse(res, 'Asset returned successfully', { allocation_id: value.allocation_id });
    } catch (err) {
      next(err);
    }
  },

  async transferRequest(req, res, next) {
    try {
      const { error, value } = transferRequestSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      const allocation = await AllocationModel.allocationById(value.allocation_id);
      if (!allocation) {
        return errorResponse(res, 'Allocation not found', null, 404);
      }

      if (allocation.status !== 'allocated') {
        return errorResponse(res, 'Only active allocations can be transferred', null, 409);
      }

      const targetUser = await AllocationModel.userById(value.transfer_to_user_id);
      if (!targetUser) {
        return errorResponse(res, 'Target user not found', null, 404);
      }

      await AllocationModel.transferRequest({
        allocationId: value.allocation_id,
        transfer_to_user_id: value.transfer_to_user_id,
        requested_by: req.user.userId,
      });

      await AllocationModel.createActivityLog({
        user_id: req.user.userId,
        action: 'request_transfer',
        details: `Requested transfer of allocation ${value.allocation_id} to user ${value.transfer_to_user_id}`,
      });

      return successResponse(res, 'Transfer request created successfully', { allocation_id: value.allocation_id });
    } catch (err) {
      next(err);
    }
  },

  async transferApprove(req, res, next) {
    try {
      const { error, value } = transferApproveSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      if (!canApprove(req.user.role)) {
        return errorResponse(res, 'Insufficient privileges to approve transfer', null, 403);
      }

      const allocation = await AllocationModel.allocationById(value.allocation_id);
      if (!allocation) {
        return errorResponse(res, 'Allocation not found', null, 404);
      }

      if (allocation.status !== 'transfer_requested') {
        return errorResponse(res, 'Allocation is not pending transfer', null, 409);
      }

      await AllocationModel.approveTransfer({ allocationId: value.allocation_id, approverId: req.user.userId });
      await AllocationModel.createActivityLog({
        user_id: req.user.userId,
        action: 'approve_transfer',
        details: `Approved transfer for allocation ${value.allocation_id}`,
      });

      const updatedAllocation = await AllocationModel.allocationById(value.allocation_id);
      return successResponse(res, 'Transfer approved successfully', updatedAllocation);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = allocationController;
