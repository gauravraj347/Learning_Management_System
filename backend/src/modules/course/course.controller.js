import * as courseService from "./course.service.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import AppError from "../../utils/AppError.js";
import uploadToCloudinary from "../../utils/uploadToCloudinary.js";

export const create = catchAsync(async (req, res) => {
  const data = await courseService.createCourse(req.body, req.user._id);
  sendResponse(res, 201, "Course created", data);
});

export const getAll = catchAsync(async (req, res) => {
  const showAll = req.user?.role === "admin";
  const data = await courseService.getAllCourses({ ...req.query, showAll });
  sendResponse(res, 200, "Courses fetched", data);
});

export const getById = catchAsync(async (req, res) => {
  const data = await courseService.getCourseById(req.params.id);
  sendResponse(res, 200, "Course fetched", data);
});

export const update = catchAsync(async (req, res) => {
  const data = await courseService.updateCourse(req.params.id, req.body);
  sendResponse(res, 200, "Course updated", data);
});

export const remove = catchAsync(async (req, res) => {
  await courseService.deleteCourse(req.params.id);
  sendResponse(res, 200, "Course deleted");
});

export const uploadThumbnail = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError("Please upload a thumbnail image", 400);
  }

  const result = await uploadToCloudinary(req.file.buffer, {
    folder: "lms/thumbnails",
    resourceType: "image",
  });

  const data = await courseService.updateCourse(req.params.id, {
    thumbnailUrl: result.url,
  });
  sendResponse(res, 200, "Thumbnail uploaded", data);
});
