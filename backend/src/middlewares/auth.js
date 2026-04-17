import jwt from "jsonwebtoken";
import User from "../modules/auth/user.model.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import config from "../config/index.js";

/**
 * Protect routes — verifies JWT from Authorization header,
 * attaches user to req.user.
 */
export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Access token is required", 401));
  }

  const decoded = jwt.verify(token, config.jwt.secret);

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    return next(new AppError("User no longer exists", 401));
  }

  if (!user.isActive) {
    return next(new AppError("Account is deactivated", 403));
  }

  req.user = user;
  next();
});

/**
 * Restrict to specific roles.
 * Usage: authorize("admin")  or  authorize("admin", "instructor")
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
