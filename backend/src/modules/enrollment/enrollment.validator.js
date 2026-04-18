import { body } from "express-validator";

export const enrollPaymentValidation = [
  body("paymentId")
    .trim()
    .notEmpty()
    .withMessage("Payment ID is required for paid enrollment"),

  body("amount")
    .optional()
    .isNumeric()
    .withMessage("Amount must be a number")
    .custom((value) => {
      if (value < 0) throw new Error("Amount cannot be negative");
      return true;
    }),
];
