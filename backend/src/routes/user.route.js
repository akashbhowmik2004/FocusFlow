import { Router } from "express";

import {
  getUserDetails,
  updateUserDetails,
  updateUserPassword,
  updateUserTheme,
} from "../controllers/user.controller.js";
import {
  updateUserSchema,
  updatePasswordSchema,
  updateThemeSchema,
} from "../schemas/user.schema.js";
import { validateBody } from "../middleware/validate.middleware.js";

const router = Router();

router.get("/", getUserDetails);
router.put("/update", validateBody(updateUserSchema), updateUserDetails);
router.put(
  "/update-password",
  validateBody(updatePasswordSchema),
  updateUserPassword,
);
router.put("/theme", validateBody(updateThemeSchema), updateUserTheme);
router.patch("/theme", validateBody(updateThemeSchema), updateUserTheme);
router.put("/update-theme", validateBody(updateThemeSchema), updateUserTheme);

export default router;
