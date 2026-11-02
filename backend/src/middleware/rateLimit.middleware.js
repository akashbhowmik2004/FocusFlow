import { rateLimit } from "express-rate-limit";

const configuredWindowMs = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10);
const windowMs =
  Number.isFinite(configuredWindowMs) && configuredWindowMs > 0
    ? configuredWindowMs
    : 15 * 60 * 1000;

const generalMax = process.env.RATE_LIMIT_MAX
  ? parseInt(process.env.RATE_LIMIT_MAX, 10)
  : (process.env.NODE_ENV === "test" ? 1000 : 100);

const authMax = process.env.AUTH_RATE_LIMIT_MAX
  ? parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10)
  : (process.env.NODE_ENV === "test" ? 500 : 20);

const customHandler = (defaultMessage) => (req, res, next, options) => {
  const resetTime = req.rateLimit?.resetTime;
  const retryAfterSec = resetTime
    ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
    : Math.max(1, Math.ceil(options.windowMs / 1000));

  res.setHeader("Retry-After", retryAfterSec);
  res.status(429).json({
    status: 429,
    error: "Too Many Requests",
    message: typeof defaultMessage === "string" ? defaultMessage : options.message,
    retryAfter: retryAfterSec,
  });
};

/**
 * General Rate Limiter - applied to all routes across /api
 */
export const generalRateLimiter = rateLimit({
  windowMs,
  max: generalMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP. Please wait a few moments and try again.",
  handler: customHandler("Too many requests from this IP. Please wait a few moments and try again."),
});

/**
 * Strict Auth Rate Limiter - applied to authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs,
  max: authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many authentication attempts. Please try again later.",
  handler: customHandler("Too many authentication attempts. Please try again later."),
});

/**
 * Factory for creating custom rate limiters (e.g. for testing)
 */
export const createCustomRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 60 * 1000,
    max: options.max || 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: options.message || "Too many requests. Please try again later.",
    handler: customHandler(options.message),
    ...options,
  });
};
