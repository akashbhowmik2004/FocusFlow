import {
  addSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} from "../controllers/subject.controller.js";
import {
  subjectSchema,
  subjectUpdateSchema,
} from "../schemas/subject.schema.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { Router } from "express";

const router = Router();

router.post("/add", validateBody(subjectSchema), addSubject);
router.get("/", getSubjects);
router.get("/:id", getSubjectById);
router.put("/:id", validateBody(subjectUpdateSchema), updateSubject);
router.delete("/:id", deleteSubject);

export default router;
