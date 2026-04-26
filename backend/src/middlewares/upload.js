import multer from "multer";
import path from "path";
import AppError from "../utils/AppError.js";

// Storage: keep files in memory (buffer) for Cloudinary upload
const storage = multer.memoryStorage();

// File filter: allow images and videos only
const fileFilter = (req, file, cb) => {
  const allowedImages = /jpeg|jpg|png|gif|webp/;
  const allowedVideos = /mp4|mkv|avi|mov|webm/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mime = file.mimetype;

  if (
    allowedImages.test(ext) &&
    mime.startsWith("image/")
  ) {
    cb(null, true);
  } else if (
    allowedVideos.test(ext) &&
    mime.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Only image (jpeg, jpg, png, gif, webp) and video (mp4, mkv, avi, mov, webm) files are allowed",
        400
      ),
      false
    );
  }
};

// Upload instances
export const uploadThumbnail = (req, res, next) => {
  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }).single("thumbnail");

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("Thumbnail must be less than 5MB", 400));
      }
      return next(new AppError(err.message, 400));
    }
    if (err) return next(err);
    next();
  });
};

export const uploadVideo = (req, res, next) => {
  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB (Cloudinary free tier limit)
  }).single("video");

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("Video must be less than 100MB", 400));
      }
      return next(new AppError(err.message, 400));
    }
    if (err) return next(err);
    next();
  });
};
