import { Router } from "express";
import {
  addSession,
  cancelSessionFocus,
  completeSessionFocus,
  deleteSession,
  getActiveSession,
  getSessions,
  pauseSessionFocus,
  resumeSessionFocus,
  startSessionFocus,
  updateSession,
} from "../controllers/session.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  sessionSchema,
  sessionUpdateSchema,
} from "../schemas/session.schema.js";

const router = Router();

router.get("/", getSessions);
router.get("/focus/active", getActiveSession);
router.post("/", validateBody(sessionSchema), addSession);
router.post("/:id/focus/start", startSessionFocus);
router.post("/:id/focus/pause", pauseSessionFocus);
router.post("/:id/focus/resume", resumeSessionFocus);
router.post("/:id/focus/complete", completeSessionFocus);
router.post("/:id/focus/cancel", cancelSessionFocus);
router.put("/:id", validateBody(sessionUpdateSchema), updateSession);
router.delete("/:id", deleteSession);

export default router;
