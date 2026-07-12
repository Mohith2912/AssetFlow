const Joi = require('joi');
const BookingModel = require('../models/bookingModel');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const bookingSchema = Joi.object({
  asset_id: Joi.number().integer().positive().required(),
  user_id: Joi.number().integer().positive().required(),
  start_time: Joi.date().iso().required(),
  end_time: Joi.date().iso().greater(Joi.ref('start_time')).required(),
  purpose: Joi.string().trim().min(3).max(255).optional().allow(null, ''),
  status: Joi.string().valid('pending', 'approved', 'rejected', 'completed', 'cancelled').required(),
});

const bookingUpdateSchema = Joi.object({
  asset_id: Joi.number().integer().positive().required(),
  start_time: Joi.date().iso().required(),
  end_time: Joi.date().iso().greater(Joi.ref('start_time')).required(),
  purpose: Joi.string().trim().min(3).max(255).optional().allow(null, ''),
  status: Joi.string().valid('pending', 'approved', 'rejected', 'completed', 'cancelled').required(),
});

const cancelSchema = Joi.object({
  status: Joi.string().valid('cancelled').required(),
});

const rolesAllowed = ['Employee', 'Department Head', 'Asset Manager', 'Admin'];

const bookingController = {
  async list(req, res, next) {
    try {
      const filters = {
        asset_id: req.query.asset_id ? Number(req.query.asset_id) : undefined,
        user_id: req.query.user_id ? Number(req.query.user_id) : undefined,
        status: req.query.status ? req.query.status.toLowerCase() : undefined,
        start_date: req.query.start_date ? req.query.start_date : undefined,
      };

      const bookings = await BookingModel.findAll(filters);
      return successResponse(res, 'Bookings retrieved successfully', bookings);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      if (!rolesAllowed.includes(req.user.role)) {
        return errorResponse(res, 'Insufficient privileges to create bookings', null, 403);
      }

      const { error, value } = bookingSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      const asset = await BookingModel.assetById(value.asset_id);
      if (!asset) {
        return errorResponse(res, 'Asset not found', null, 404);
      }

      const user = await BookingModel.userById(value.user_id);
      if (!user) {
        return errorResponse(res, 'User not found', null, 404);
      }

      const hasOverlap = await BookingModel.hasOverlap(value);
      if (hasOverlap) {
        return errorResponse(res, 'Booking overlaps with an existing booking', null, 409);
      }

      const bookingId = await BookingModel.create({
        ...value,
        status: value.status,
      });

      await BookingModel.logActivity({
        user_id: req.user.userId,
        action: 'create_booking',
        details: `Created booking ${bookingId} for asset ${value.asset_id}`,
      });

      const booking = await BookingModel.findById(bookingId);
      return successResponse(res, 'Booking created successfully', booking, 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      if (!rolesAllowed.includes(req.user.role)) {
        return errorResponse(res, 'Insufficient privileges to update bookings', null, 403);
      }

      const { error, value } = bookingUpdateSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      const booking = await BookingModel.findById(req.params.id);
      if (!booking) {
        return errorResponse(res, 'Booking not found', null, 404);
      }

      const asset = await BookingModel.assetById(value.asset_id);
      if (!asset) {
        return errorResponse(res, 'Asset not found', null, 404);
      }

      const hasOverlap = await BookingModel.hasOverlap({ ...value, excludeId: req.params.id });
      if (hasOverlap) {
        return errorResponse(res, 'Booking overlaps with an existing booking', null, 409);
      }

      await BookingModel.update(req.params.id, value);
      await BookingModel.logActivity({
        user_id: req.user.userId,
        action: 'update_booking',
        details: `Updated booking ${req.params.id} for asset ${value.asset_id}`,
      });

      const updatedBooking = await BookingModel.findById(req.params.id);
      return successResponse(res, 'Booking updated successfully', updatedBooking);
    } catch (err) {
      next(err);
    }
  },

  async cancel(req, res, next) {
    try {
      if (!rolesAllowed.includes(req.user.role)) {
        return errorResponse(res, 'Insufficient privileges to cancel bookings', null, 403);
      }

      const { error, value } = cancelSchema.validate(req.body);
      if (error) {
        return errorResponse(res, error.message, null, 400);
      }

      const booking = await BookingModel.findById(req.params.id);
      if (!booking) {
        return errorResponse(res, 'Booking not found', null, 404);
      }

      if (booking.status === 'cancelled') {
        return errorResponse(res, 'Booking is already cancelled', null, 409);
      }

      await BookingModel.cancel(req.params.id);
      await BookingModel.logActivity({
        user_id: req.user.userId,
        action: 'cancel_booking',
        details: `Cancelled booking ${req.params.id}`,
      });

      const updatedBooking = await BookingModel.findById(req.params.id);
      return successResponse(res, 'Booking cancelled successfully', updatedBooking);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = bookingController;
