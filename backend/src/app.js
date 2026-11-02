import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import subjectRoutes from "./routes/subject.route.js";
import topicRoutes from "./routes/topic.route.js";
import sessionRoutes from "./routes/session.route.js";
import { requireAuth } from "./middleware/auth.middleware.js";
import {
  generalRateLimiter,
  authRateLimiter,
} from "./middleware/rateLimit.middleware.js";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiter across all backend API routes
app.use("/api", generalRateLimiter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Authentication routes (protected by both general and strict auth rate limiters)
app.use("/api/auth", authRateLimiter, authRoutes);
// Subject routes
app.use("/api/subject", requireAuth, subjectRoutes);
// User routes
app.use("/api/user", requireAuth, userRoutes);
// Topic routes
app.use("/api/topic", requireAuth, topicRoutes);
app.use("/api/topics", requireAuth, topicRoutes);
app.use("/api/session", requireAuth, sessionRoutes);

export default app;
