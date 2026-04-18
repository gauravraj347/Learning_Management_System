import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import categoryRoutes from "../modules/category/category.routes.js";
import courseRoutes from "../modules/course/course.routes.js";
import enrollmentRoutes from "../modules/enrollment/enrollment.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
import progressRoutes from "../modules/progress/progress.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/courses", courseRoutes);
router.use("/enrollments", enrollmentRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/progress", progressRoutes);
export default router;
