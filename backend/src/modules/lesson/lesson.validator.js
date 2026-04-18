import { body } from "express-validator";

export const createLessonValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Lesson title is required")
    .isLength({ max: 255 })
    .withMessage("Title cannot exceed 255 characters"),

  body("content").optional().trim(),

  body("videoUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Video URL must be a valid URL"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),

  body("isFree")
    .optional()
    .isBoolean()
    .withMessage("isFree must be boolean"),
];

export const updateLessonValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 255 })
    .withMessage("Title cannot exceed 255 characters"),

  body("content").optional().trim(),

  body("videoUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Video URL must be a valid URL"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Sort order must be a non-negative integer"),

  body("isFree")
    .optional()
    .isBoolean()
    .withMessage("isFree must be boolean"),
];
