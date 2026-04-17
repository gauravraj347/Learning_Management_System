import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import config from "./config/index.js";
import routes from "./routes/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import AppError from "./utils/AppError.js";

const createApp = () => {
  const app = express();

  // ── Security ──────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: config.env === "development" ? true : process.env.CLIENT_URL,
      credentials: true,
    })
  );

  // ── Rate Limiting ─────────────────────────────────────
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: { success: false, message: "Too many requests, try again later" },
  });
  app.use("/api", limiter);

  // ── Body Parsing ──────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // ── Logging ───────────────────────────────────────────
  if (config.env === "development") {
    app.use(morgan("dev"));
  }

  // ── Health Check ──────────────────────────────────────
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
  });

  // ── Static Files (uploads) ─────────────────────────────
  app.use("/uploads", express.static("uploads"));

  // ── API Routes ────────────────────────────────────────
  app.use("/api/v1", routes);

  // ── 404 Handler ───────────────────────────────────────
  app.use((req, res, next) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404));
  });

  // ── Global Error Handler ──────────────────────────────
  app.use(errorHandler);

  return app;
};

export default createApp;
