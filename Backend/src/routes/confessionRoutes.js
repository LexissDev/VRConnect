import express from "express";
import {
  createConfession,
  reportConfession,
  reactToConfession,
  commentOnConfession,
  getComments,
  getConfessions,
} from "../controllers/confessionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createConfession);
router.get("/", getConfessions);
router.post("/react", authMiddleware, reactToConfession);
router.post("/comment", authMiddleware, commentOnConfession);
router.get("/:confessionId/comments", getComments);
router.post("/report", authMiddleware, reportConfession);

export default router;
