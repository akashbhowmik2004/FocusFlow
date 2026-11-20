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
      if (process.env.NODE_ENV === "production") {
        return callback(new Error("CORS request blocked: origin not allowed"), false);
      }
      return callback(null, true); // Permissive in non-production development
    },
    credentials: true,
  }),
);

// Standard security headers without extra dependencies
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

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

// Centralized safe error handler to prevent stack trace disclosure
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error("Unhandled API Error:", err.message);
  const status = typeof err.status === "number" ? err.status : 500;
  return res.status(status).json({
    message: status < 500 ? err.message : "Internal server error",
  });
});

export default app;
