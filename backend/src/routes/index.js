import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import categoryRoutes from "../modules/category/category.routes.js";
import courseRoutes from "../modules/course/course.routes.js";
import enrollmentRoutes from "../modules/enrollment/enrollment.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/courses", courseRoutes);
router.use("/enrollments", enrollmentRoutes);
export default router;
