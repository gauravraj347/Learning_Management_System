import Category from "./category.model.js";
import AppError from "../../utils/AppError.js";

/**
 * Create a new category.
 */
export const createCategory = async (data) => {
  const existing = await Category.findOne({ name: data.name });
  if (existing) {
    throw new AppError("Category with this name already exists", 409);
  }
  return Category.create(data);
};

/**
 * Get all categories (active only for public, all for admin).
 */
export const getAllCategories = async ({ includeInactive = false }) => {
  const filter = includeInactive ? {} : { isActive: true };
  return Category.find(filter).sort({ name: 1 });
};

/**
 * Get a single category by ID.
 */
export const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }
  return category;
};

/**
 * Update a category.
 */
export const updateCategory = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

/**
 * Delete a category (soft delete — set isActive to false).
 */
export const deleteCategory = async (id) => {
  const category = await Category.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};
