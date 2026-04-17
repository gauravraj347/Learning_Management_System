import { Router } from "express";
import * as authController from "./auth.controller.js";
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} from "./auth.validator.js";
import validate from "../../middlewares/validate.js";
import { protect } from "../../middlewares/auth.js";
import { uploadThumbnail } from "../../middlewares/upload.js";

const router = Router();

// Public
router.post("/register", registerValidation, validate, authController.register);
router.post("/login", loginValidation, validate, authController.login);

// Protected
router.get("/profile", protect, authController.getProfile);

router.put(
  "/profile",
  protect,
  updateProfileValidation,
  validate,
  authController.updateProfile
);

router.put(
  "/change-password",
  protect,
  changePasswordValidation,
  validate,
  authController.changePassword
);

router.post("/avatar", protect, uploadThumbnail, authController.uploadAvatar);

export default router;
