import express from "express";
import helmet from "helmet";
import cors from "cors";

import healthRouter from "./routes/health";
import networksRouter from "./routes/networks";
import visualizeRouter from "./routes/visualize";
import visualizeV2Router from "./routes/visualize_v2";
import visualizeLatestRouter from "./routes/visualize_latest";
import withinRouter from "./routes/within";
import analyticsRouter from "./routes/analytics";
import { pool } from "./db";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/networks", networksRouter);
app.use("/api/v1/visualize", visualizeRouter);
app.use("/api/v1/visualize_v2", visualizeV2Router);
app.use("/api/v1/visualize_latest", visualizeLatestRouter);
app.use("/api/v1/within", withinRouter);
app.use("/api/v1/analytics", analyticsRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 5000;

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`ShadowCheck API listening on http://localhost:${port}`);
});

// Handle server errors, especially EADDRINUSE
server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please stop any other processes using this port and try again.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// graceful shutdown
const shutdown = async (signal: string) => {
  try {
    console.log(`\nReceived ${signal}, shutting down...`);
    server.close(() => console.log("HTTP server closed"));
    await pool.end();
    console.log("DB pool closed");
  } catch (e) {
    console.error("Shutdown error:", e);
  } finally {
    process.exit(0);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
