import { Router } from "express";

import {
  getUserDetails,
  updateUserDetails,
  updateUserPassword,
  deleteUserAccount,
  exportUserData,
  completeOnboarding,
} from "../controllers/user.controller.js";
import {
  updateUserSchema,
  updatePasswordSchema,
  deleteAccountSchema,
  onboardingSchema,
} from "../schemas/user.schema.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

router.get("/", getUserDetails);
router.put("/update", validateBody(updateUserSchema), updateUserDetails);
router.put("/onboarding", validateBody(onboardingSchema), completeOnboarding);
router.post("/onboarding", validateBody(onboardingSchema), completeOnboarding);
router.put("/onboarding/progress", validateBody(onboardingSchema), completeOnboarding);
router.patch("/onboarding", validateBody(onboardingSchema), completeOnboarding);
router.put(
  "/update-password",
  authRateLimiter,
  validateBody(updatePasswordSchema),
  updateUserPassword,
);
router.delete(
  "/account",
  authRateLimiter,
  validateBody(deleteAccountSchema),
  deleteUserAccount,
);
router.get("/export", exportUserData);

export default router;
