const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/userModel');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});



function buildAuthPayload(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

const authController = {
  async signup(req, res, next) {
    try {
      const { error, value } = signupSchema.validate(req.body);
      if (error) return errorResponse(res, error.message, null, 400);

      const existingUser = await User.findByEmail(value.email);
      if (existingUser) {
        return errorResponse(res, 'Email is already registered', null, 409);
      }

      const hashedPassword = await bcrypt.hash(value.password, 10);
      const user = await User.create({
        name: value.name,
        email: value.email,
        password: hashedPassword,
      });

      return successResponse(res, 'Account created successfully', { id: user.id, name: user.name, email: user.email, role: user.role }, 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) return errorResponse(res, error.message, null, 400);

      const user = await User.findByEmail(value.email);

      if (!user) return errorResponse(res, 'Invalid credentials', null, 401);

      if (String(user.status || '').toLowerCase() !== 'active') {
        return errorResponse(res, 'Account is not active', null, 403);
      }

      const storedHash = user.password_hash || user.password;
      const validPassword = storedHash && /^\$2[aby]\$/i.test(storedHash)
        ? await bcrypt.compare(value.password, storedHash)
        : storedHash === value.password;
      
      if (!validPassword) return errorResponse(res, 'Invalid credentials', null, 401);

      const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'assetflow-demo-secret', {
        expiresIn: '8h',
      });

      return successResponse(res, 'Authentication successful', { token, user: buildAuthPayload(user) });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      const user = await User.findById(req.user.userId);

      if (!user) return errorResponse(res, 'User not found', null, 404);

      return successResponse(res, 'User retrieved successfully', { user: buildAuthPayload(user) });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
