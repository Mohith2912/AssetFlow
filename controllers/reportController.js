const ReportModel = require('../models/reportModel');
const { successResponse } = require('../utils/apiResponse');

const reportController = {
  async summary(req, res, next) {
    try {
      const data = await ReportModel.summary();
      return successResponse(res, 'Report summary retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  },

  async assetsUtilization(req, res, next) {
    try {
      const data = await ReportModel.assetsUtilization();
      return successResponse(res, 'Assets utilization report retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  },

  async maintenanceFrequency(req, res, next) {
    try {
      const data = await ReportModel.maintenanceFrequency();
      return successResponse(res, 'Maintenance frequency report retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  },

  async departmentSummary(req, res, next) {
    try {
      const data = await ReportModel.departmentSummary();
      return successResponse(res, 'Department summary report retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  },

  async bookingHeatmap(req, res, next) {
    try {
      const data = await ReportModel.bookingHeatmap();
      return successResponse(res, 'Booking heatmap report retrieved successfully', data);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = reportController;
