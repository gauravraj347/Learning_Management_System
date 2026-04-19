import * as wishlistService from "./wishlist.service.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";

/**
 * POST /wishlist/:courseId — Add course to wishlist.
 */
export const addToWishlist = catchAsync(async (req, res) => {
  const data = await wishlistService.addToWishlist(
    req.user._id,
    req.params.courseId
  );
  sendResponse(res, 201, "Added to wishlist", data);
});

/**
 * DELETE /wishlist/:courseId — Remove course from wishlist.
 */
export const removeFromWishlist = catchAsync(async (req, res) => {
  await wishlistService.removeFromWishlist(req.user._id, req.params.courseId);
  sendResponse(res, 200, "Removed from wishlist");
});

/**
 * GET /wishlist — Get my wishlist.
 */
export const getMyWishlist = catchAsync(async (req, res) => {
  const data = await wishlistService.getMyWishlist(req.user._id, req.query);
  sendResponse(res, 200, "Wishlist fetched", data);
});

/**
 * GET /wishlist/:courseId/check — Check if course is in wishlist.
 */
export const checkWishlist = catchAsync(async (req, res) => {
  const data = await wishlistService.checkWishlist(
    req.user._id,
    req.params.courseId
  );
  sendResponse(res, 200, "Wishlist status checked", data);
});
