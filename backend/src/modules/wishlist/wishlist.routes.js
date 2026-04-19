import { Router } from "express";
import * as wishlistController from "./wishlist.controller.js";
import { protect } from "../../middlewares/auth.js";

const router = Router();

// All wishlist routes require auth
router.use(protect);

// Get my wishlist
router.get("/", wishlistController.getMyWishlist);

// Add to wishlist
router.post("/:courseId", wishlistController.addToWishlist);

// Check if in wishlist
router.get("/:courseId/check", wishlistController.checkWishlist);

// Remove from wishlist
router.delete("/:courseId", wishlistController.removeFromWishlist);

export default router;
