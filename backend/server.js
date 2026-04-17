import config from "./src/config/index.js";
import createApp from "./src/app.js";

const start = async () => {

  // Create Express app
  const app = createApp();

  // Start server
  const server = app.listen(config.port, () => {
    console.log(
      `Server running in ${config.env} mode on http://localhost:${config.port}`
    );
    console.log(`Health check: http://localhost:${config.port}/health`);
    console.log(
      `API base: http://localhost:${config.port}/api/v1`
    );
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Handle unhandled rejections
  process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION:", err.message);
    server.close(() => process.exit(1));
  });
};

start();