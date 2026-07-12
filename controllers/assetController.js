const Joi = require('joi');
const AssetModel = require('../models/assetModel');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const assetSchema = Joi.object({
  asset_code: Joi.string().trim().optional(),
  name: Joi.string().trim().min(2).max(150).required(),
  category_id: Joi.number().integer().positive().required(),
  department_id: Joi.number().integer().positive().optional().allow(null),
  serial_number: Joi.string().trim().optional().allow(null, ''),
  condition: Joi.string().trim().optional().allow(null, ''),
  location: Joi.string().trim().optional().allow(null, ''),
  status: Joi.string().valid('available', 'allocated', 'reserved', 'under_maintenance', 'lost', 'retired', 'disposed').required(),
  is_shared: Joi.boolean().required(),
  is_bookable: Joi.boolean().required(),
});

const statusSchema = Joi.object({
  status: Joi.string().valid('available', 'allocated', 'reserved', 'under_maintenance', 'lost', 'retired', 'disposed').required(),
});

const assetController = {
  async list(req, res, next) {
    try {
      const filters = {
        category_id: req.query.category_id ? Number(req.query.category_id) : undefined,
        status: req.query.status ? req.query.status.toLowerCase() : undefined,
        department_id: req.query.department_id ? Number(req.query.department_id) : undefined,
        search: req.query.search ? String(req.query.search).trim() : undefined,
      };

      const assets = await AssetModel.findAll(filters);
      return successResponse(res, 'Assets retrieved successfully', assets);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const asset = await AssetModel.findById(req.params.id);
      if (!asset) {
        return errorResponse(res, 'Asset not found', null, 404);
      }

      return successResponse(res, 'Asset retrieved successfully', asset);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { error, value } = assetSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      if (!(await AssetModel.categoryExists(value.category_id))) {
        return errorResponse(res, 'Asset category does not exist', null, 400);
      }

      const assetCode = value.asset_code && value.asset_code.length > 0 ? value.asset_code : await AssetModel.generateAssetCode();
      if (value.asset_code && await AssetModel.existsByCode(assetCode)) {
        return errorResponse(res, 'Asset code already exists', null, 409);
      }

      const assetData = { ...value, asset_code: assetCode };
      const created = await AssetModel.create(assetData);
      const asset = await AssetModel.findById(created.id);

      return successResponse(res, 'Asset created successfully', asset, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { error, value } = assetSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      const asset = await AssetModel.findById(req.params.id);
      if (!asset) {
        return errorResponse(res, 'Asset not found', null, 404);
      }

      if (!(await AssetModel.categoryExists(value.category_id))) {
        return errorResponse(res, 'Asset category does not exist', null, 400);
      }

      const assetCode = value.asset_code && value.asset_code.length > 0 ? value.asset_code : asset.asset_code;
      if (value.asset_code && value.asset_code !== asset.asset_code && await AssetModel.existsByCode(assetCode)) {
        return errorResponse(res, 'Asset code already exists', null, 409);
      }

      const assetData = { ...value, asset_code: assetCode };
      await AssetModel.update(req.params.id, assetData);
      const updatedAsset = await AssetModel.findById(req.params.id);

      return successResponse(res, 'Asset updated successfully', updatedAsset);
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

      const asset = await AssetModel.findById(req.params.id);
      if (!asset) {
        return errorResponse(res, 'Asset not found', null, 404);
      }

      await AssetModel.updateStatus(req.params.id, value.status);
      const updatedAsset = await AssetModel.findById(req.params.id);

      return successResponse(res, 'Asset status updated successfully', updatedAsset);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = assetController;
