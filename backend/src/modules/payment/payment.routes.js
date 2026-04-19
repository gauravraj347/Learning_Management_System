import { Router } from "express";
import * as paymentController from "./payment.controller.js";
import { verifyPaymentValidation } from "./payment.validator.js";
import validate from "../../middlewares/validate.js";
import { protect, authorize } from "../../middlewares/auth.js";

const router = Router();

// All payment routes require auth
router.use(protect);

// ── Student Routes ─────────────────────────────────────
// Create Razorpay order for a course
router.post("/create-order/:courseId", paymentController.createOrder);

// Verify payment after Razorpay checkout
router.post(
  "/verify",
  verifyPaymentValidation,
  validate,
  paymentController.verifyPayment
);

// Get my payment history
router.get("/my", paymentController.getMyPayments);

// Get specific payment by Razorpay order ID
router.get("/order/:orderId", paymentController.getPaymentByOrderId);

// ── Admin Routes ───────────────────────────────────────
// Get all payments (revenue view)
router.get("/all", authorize("admin"), paymentController.getAllPayments);

export default router;
