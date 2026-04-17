import multer from "multer";
import path from "path";
import AppError from "../utils/AppError.js";

// Storage: save to /uploads/<type>/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.uploadType || "misc";
    cb(null, `uploads/${type}`);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

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
  req.uploadType = "thumbnails";
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
  req.uploadType = "videos";
  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  }).single("video");

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("Video must be less than 500MB", 400));
      }
      return next(new AppError(err.message, 400));
    }
    if (err) return next(err);
    next();
  });
};
