import * as dashboardService from "./dashboard.service.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";

/**
 * GET /dashboard/admin — Admin dashboard stats.
 */
export const getAdminDashboard = catchAsync(async (req, res) => {
  const data = await dashboardService.getAdminDashboard();
  sendResponse(res, 200, "Admin dashboard fetched", data);
});

/**
 * GET /dashboard/student — Student dashboard (my courses + progress).
 */
export const getStudentDashboard = catchAsync(async (req, res) => {
  const data = await dashboardService.getStudentDashboard(req.user._id);
  sendResponse(res, 200, "Student dashboard fetched", data);
});
