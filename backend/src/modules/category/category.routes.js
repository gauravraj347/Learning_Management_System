import { Router } from "express";
import * as categoryController from "./category.controller.js";
import {
  createCategoryValidation,
  updateCategoryValidation,
} from "./category.validator.js";
import validate from "../../middlewares/validate.js";
import { protect, authorize } from "../../middlewares/auth.js";

const router = Router();

// Public
router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);

// Admin only
router.post(
  "/",
  protect,
  authorize("admin"),
  createCategoryValidation,
  validate,
  categoryController.create
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateCategoryValidation,
  validate,
  categoryController.update
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  categoryController.remove
);

export default router;
