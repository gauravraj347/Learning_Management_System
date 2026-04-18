import * as lessonService from "./lesson.service.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";

export const create = catchAsync(async (req, res) => {
  const data = await lessonService.createLesson(req.params.courseId, req.body);
  sendResponse(res, 201, "Lesson created", data);
});

export const getAll = catchAsync(async (req, res) => {
  const data = await lessonService.getLessonsByCourse(req.params.courseId);
  sendResponse(res, 200, "Lessons fetched", data);
});

export const getById = catchAsync(async (req, res) => {
  const data = await lessonService.getLessonById(
    req.params.courseId,
    req.params.id
  );
  sendResponse(res, 200, "Lesson fetched", data);
});

export const update = catchAsync(async (req, res) => {
  const data = await lessonService.updateLesson(
    req.params.courseId,
    req.params.id,
    req.body
  );
  sendResponse(res, 200, "Lesson updated", data);
});

export const remove = catchAsync(async (req, res) => {
  await lessonService.deleteLesson(req.params.courseId, req.params.id);
  sendResponse(res, 200, "Lesson deleted");
});
