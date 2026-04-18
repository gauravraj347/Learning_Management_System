import { Router } from "express";
import * as dashboardController from "./dashboard.controller.js";
import { protect, authorize } from "../../middlewares/auth.js";

const router = Router();

// All dashboard routes require auth
router.use(protect);

// Admin dashboard (admin only)
router.get("/admin", authorize("admin"), dashboardController.getAdminDashboard);

// Student dashboard (any authenticated user)
router.get("/student", dashboardController.getStudentDashboard);

export default router;
