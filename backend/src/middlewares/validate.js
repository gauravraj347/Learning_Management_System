import { validationResult } from "express-validator";

/**
 * Middleware that checks express-validator results.
 * Place after your validation chain in the route.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(400).json({
      success: false,
      message: messages.join(". "),
    });
  }

  next();
};

export default validate;
