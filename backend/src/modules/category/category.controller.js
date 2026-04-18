import * as categoryService from "./category.service.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";

export const create = catchAsync(async (req, res) => {
  const data = await categoryService.createCategory(req.body);
  sendResponse(res, 201, "Category created", data);
});

export const getAll = catchAsync(async (req, res) => {
  const includeInactive = req.user?.role === "admin";
  const data = await categoryService.getAllCategories({ includeInactive });
  sendResponse(res, 200, "Categories fetched", data);
});

export const getById = catchAsync(async (req, res) => {
  const data = await categoryService.getCategoryById(req.params.id);
  sendResponse(res, 200, "Category fetched", data);
});

export const update = catchAsync(async (req, res) => {
  const data = await categoryService.updateCategory(req.params.id, req.body);
  sendResponse(res, 200, "Category updated", data);
});

export const remove = catchAsync(async (req, res) => {
  await categoryService.deleteCategory(req.params.id);
  sendResponse(res, 200, "Category deleted");
});
