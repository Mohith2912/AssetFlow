const DashboardModel = require('../models/dashboardModel');
const { successResponse } = require('../utils/apiResponse');

const dashboardController = {
  async stats(req, res, next) {
    try {
      const assetSummary = await DashboardModel.getAssetSummary();
      const bookingSummary = await DashboardModel.getBookingSummary();
      const allocationSummary = await DashboardModel.getAllocationSummary();
      const maintenanceSummary = await DashboardModel.getMaintenanceSummary();

      return successResponse(res, 'Dashboard stats retrieved successfully', {
        assetsAvailable: assetSummary.assetsAvailable || 0,
        assetsAllocated: assetSummary.assetsAllocated || 0,
        assetsUnderMaintenance: assetSummary.assetsUnderMaintenance || 0,
        activeBookings: bookingSummary.activeBookings || 0,
        completedBookings: bookingSummary.completedBookings || 0,
        overdueReturns: allocationSummary.overdueReturns || 0,
        pendingMaintenance: maintenanceSummary.pendingMaintenance || 0,
        pendingTransfers: allocationSummary.pendingTransfers || 0,
      });
    } catch (err) {
      next(err);
    }
  },

  async summary(req, res, next) {
    try {
      const assetSummary = await DashboardModel.getAssetSummary();
      const bookingSummary = await DashboardModel.getBookingSummary();
      const allocationSummary = await DashboardModel.getAllocationSummary();
      const maintenanceSummary = await DashboardModel.getMaintenanceSummary();

      return successResponse(res, 'Dashboard summary retrieved successfully', {
        assetsAvailable: assetSummary.assetsAvailable || 0,
        assetsAllocated: assetSummary.assetsAllocated || 0,
        assetsUnderMaintenance: assetSummary.assetsUnderMaintenance || 0,
        activeBookings: bookingSummary.activeBookings || 0,
        completedBookings: bookingSummary.completedBookings || 0,
        overdueReturns: allocationSummary.overdueReturns || 0,
        pendingMaintenance: maintenanceSummary.pendingMaintenance || 0,
        pendingTransfers: allocationSummary.pendingTransfers || 0,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = dashboardController;
