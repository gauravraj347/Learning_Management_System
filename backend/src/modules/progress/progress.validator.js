import { body } from "express-validator";

export const updateWatchTimeValidation = [
  body("watchedSeconds")
    .notEmpty()
    .withMessage("watchedSeconds is required")
    .isInt({ min: 0 })
    .withMessage("watchedSeconds must be a non-negative integer"),
];
