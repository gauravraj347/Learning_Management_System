import * as authService from "./auth.service.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import AppError from "../../utils/AppError.js";

export const register = catchAsync(async (req, res) => {
  const data = await authService.register(req.body);
  sendResponse(res, 201, "Registration successful", data);
});

export const login = catchAsync(async (req, res) => {
  const data = await authService.login(req.body);
  sendResponse(res, 200, "Login successful", data);
});

export const getProfile = catchAsync(async (req, res) => {
  const data = await authService.getProfile(req.user._id);
  sendResponse(res, 200, "Profile fetched", data);
});

export const updateProfile = catchAsync(async (req, res) => {
  const data = await authService.updateProfile(req.user._id, req.body);
  sendResponse(res, 200, "Profile updated", data);
});

export const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const data = await authService.changePassword(
    req.user._id,
    currentPassword,
    newPassword
  );
  sendResponse(res, 200, "Password changed", data);
});

export const uploadAvatar = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError("Please upload an avatar image", 400);
  }

  const avatar = `/uploads/thumbnails/${req.file.filename}`;
  const data = await authService.updateProfile(req.user._id, { avatar });
  // Override the allowedFields filter — avatar is updated separately
  data.avatar = avatar;
  await data.save();
  sendResponse(res, 200, "Avatar uploaded", data);
});
