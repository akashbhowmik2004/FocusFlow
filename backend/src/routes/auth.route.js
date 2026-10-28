import { Router } from "express";
import {
  signup,
  login,
  logout,
  getMe,
  googleAuth,
  googleCallback,
  googleToken,
} from "../controllers/auth.controller.js";
import { signupSchema, loginSchema } from "../schemas/auth.schema.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Email & password
router.post("/signup", validateBody(signupSchema), signup);
router.post("/login", validateBody(loginSchema), login);
router.post("/logout", logout);

// Session verification (Protected by auth middleware)
router.get("/me", requireAuth, getMe);

// Google OAuth
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.post("/google", googleToken);

export default router;
