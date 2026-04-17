import jwt from "jsonwebtoken";
import User from "./user.model.js";
import AppError from "../../utils/AppError.js";
import config from "../../config/index.js";
import { sendWelcomeEmail } from "../../utils/emailService.js";

/**
 * Generate JWT token for a user.
 */
const signToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

/**
 * Build the token response object (reusable for register & login).
 */
const createTokenResponse = (user) => {
  const token = signToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

/**
 * Register a new user.
 */
export const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const user = await User.create({ name, email, password, role });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user).catch(() => {});

  return createTokenResponse(user);
};

/**
 * Login with email & password.
 */
export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  return createTokenResponse(user);
};

/**
 * Get current user profile.
 */
export const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

/**
 * Update user profile (name, bio, phone).
 */
export const updateProfile = async (userId, updates) => {
  const allowedFields = ["name", "bio", "phone"];
  const filtered = {};
  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) {
      filtered[key] = updates[key];
    }
  });

  const user = await User.findByIdAndUpdate(userId, filtered, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

/**
 * Change password (requires current password).
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError("Current password is incorrect", 401);
  }

  user.password = newPassword;
  await user.save();

  return createTokenResponse(user);
};
