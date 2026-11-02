import { Router } from "express";
import {
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic,
  createTopicRevision,
  scheduleTopicRevision,
} from "../controllers/topic.controller.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  createTopicSchema,
  updateTopicSchema,
  createRevisionSchema,
  manualRevisionScheduleSchema,
} from "../schemas/topic.schema.js";

const router = Router();

router.get("/", getAllTopics);
router.get("/:id", getTopicById);
router.patch(
  "/:id/revision-schedule",
  validateBody(manualRevisionScheduleSchema),
  scheduleTopicRevision,
);
router.post(
  "/:id/revisions",
  validateBody(createRevisionSchema),
  createTopicRevision,
);
router.post("/:subjectId", validateBody(createTopicSchema), createTopic);
router.put("/:id", validateBody(updateTopicSchema), updateTopic);
export default router;
