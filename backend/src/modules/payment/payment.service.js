import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "./payment.model.js";
import Course from "../course/course.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import AppError from "../../utils/AppError.js";
import config from "../../config/index.js";
import { sendEnrollmentEmail } from "../../utils/emailService.js";
import User from "../auth/user.model.js";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

/**
 * Step 1: Create a Razorpay order for a paid course.
 * Called when student clicks "Buy Now".
 */
export const createOrder = async (studentId, courseId) => {
  // 1. Verify course exists and is published
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (!course.isPublished) {
    throw new AppError("Course is not available for purchase", 400);
  }

  if (course.price === 0) {
    throw new AppError(
      "This is a free course. Use the free enrollment endpoint.",
      400
    );
  }

  // 2. Check if already enrolled
  const existing = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: { $in: ["active", "completed"] },
  });

  if (existing) {
    throw new AppError("You are already enrolled in this course", 409);
  }

  // 3. Check if there's a pending order
  const pendingOrder = await Payment.findOne({
    student: studentId,
    course: courseId,
    status: "created",
  });

  if (pendingOrder) {
    // Return the existing pending order
    return {
      orderId: pendingOrder.razorpayOrderId,
      amount: pendingOrder.amount,
      currency: pendingOrder.currency,
      courseName: course.title,
      keyId: config.razorpay.keyId,
    };
  }

  // 4. Create Razorpay order
  const receiptId = `rcpt_${studentId.toString().slice(-6)}_${Date.now()}`;

  const razorpayOrder = await razorpay.orders.create({
    amount: course.price * 100, // Razorpay expects amount in paise
    currency: "INR",
    receipt: receiptId,
    notes: {
      courseId: courseId.toString(),
      studentId: studentId.toString(),
      courseName: course.title,
    },
  });

  // 5. Save payment record
  await Payment.create({
    student: studentId,
    course: courseId,
    razorpayOrderId: razorpayOrder.id,
    amount: course.price,
    currency: "INR",
    receiptId,
    status: "created",
  });

  return {
    orderId: razorpayOrder.id,
    amount: course.price,
    amountInPaise: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    courseName: course.title,
    keyId: config.razorpay.keyId,
  };
};

/**
 * Step 2: Verify payment after Razorpay checkout completes.
 * Called from frontend after successful payment.
 */
export const verifyPayment = async (
  studentId,
  { razorpay_order_id, razorpay_payment_id, razorpay_signature }
) => {
  // 1. Find the payment record
  const payment = await Payment.findOne({
    razorpayOrderId: razorpay_order_id,
    student: studentId,
  });

  if (!payment) {
    throw new AppError("Payment record not found", 404);
  }

  if (payment.status === "paid") {
    throw new AppError("Payment already verified", 400);
  }

  // 2. Verify signature (HMAC SHA256)
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", config.razorpay.keySecret)
    .update(body)
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) {
    // Mark payment as failed
    payment.status = "failed";
    await payment.save();
    throw new AppError("Payment verification failed — invalid signature", 400);
  }

  // 3. Update payment record
  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = "paid";
  await payment.save();

  // 4. Create enrollment
  const enrollment = await Enrollment.create({
    student: studentId,
    course: payment.course,
    enrollmentType: "paid",
    amountPaid: payment.amount,
    paymentId: razorpay_payment_id,
    status: "active",
  });

  // 5. Send enrollment email (non-blocking)
  const user = await User.findById(studentId);
  const course = await Course.findById(payment.course);
  if (user && course) {
    sendEnrollmentEmail(user, course).catch(() => {});
  }

  return {
    payment: {
      id: payment._id,
      orderId: payment.razorpayOrderId,
      paymentId: payment.razorpayPaymentId,
      amount: payment.amount,
      status: payment.status,
    },
    enrollment: await enrollment.populate("course", "title description price"),
  };
};

/**
 * Get payment history for the current student.
 */
export const getMyPayments = async (studentId, query) => {
  const { page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find({ student: studentId })
      .populate("course", "title price thumbnailUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Payment.countDocuments({ student: studentId }),
  ]);

  return {
    payments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single payment by order ID.
 */
export const getPaymentByOrderId = async (studentId, orderId) => {
  const payment = await Payment.findOne({
    razorpayOrderId: orderId,
    student: studentId,
  }).populate("course", "title description price thumbnailUrl");

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  return payment;
};

/**
 * Admin: Get all payments (platform revenue view).
 */
export const getAllPayments = async (query) => {
  const { page = 1, limit = 20, status } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.status = status;

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate("student", "name email")
      .populate("course", "title price")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Payment.countDocuments(filter),
  ]);

  return {
    payments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
