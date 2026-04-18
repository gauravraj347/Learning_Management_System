import { body } from "express-validator";

export const createCourseValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 255 })
    .withMessage("Title cannot exceed 255 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category ID"),

  body("thumbnailUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Thumbnail must be a valid URL"),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be boolean"),
];

export const updateCourseValidation = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 255 })
    .withMessage("Title cannot exceed 255 characters"),

  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID"),

  body("thumbnailUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Thumbnail must be a valid URL"),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be boolean"),
];
