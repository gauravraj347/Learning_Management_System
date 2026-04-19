import * as paymentService from "./payment.service.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";

/**
 * POST /payments/create-order/:courseId — Create Razorpay order.
 */
export const createOrder = catchAsync(async (req, res) => {
  const data = await paymentService.createOrder(
    req.user._id,
    req.params.courseId
  );
  sendResponse(res, 201, "Order created", data);
});

/**
 * POST /payments/verify — Verify Razorpay payment.
 */
export const verifyPayment = catchAsync(async (req, res) => {
  const data = await paymentService.verifyPayment(req.user._id, req.body);
  sendResponse(res, 200, "Payment verified and enrolled successfully", data);
});

/**
 * GET /payments/my — Get my payment history.
 */
export const getMyPayments = catchAsync(async (req, res) => {
  const data = await paymentService.getMyPayments(req.user._id, req.query);
  sendResponse(res, 200, "Payment history fetched", data);
});

/**
 * GET /payments/order/:orderId — Get payment by order ID.
 */
export const getPaymentByOrderId = catchAsync(async (req, res) => {
  const data = await paymentService.getPaymentByOrderId(
    req.user._id,
    req.params.orderId
  );
  sendResponse(res, 200, "Payment fetched", data);
});

/**
 * GET /payments/all — Admin: get all payments.
 */
export const getAllPayments = catchAsync(async (req, res) => {
  const data = await paymentService.getAllPayments(req.query);
  sendResponse(res, 200, "All payments fetched", data);
});
