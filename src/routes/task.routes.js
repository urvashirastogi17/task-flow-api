import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from "../controllers/task.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createTask).get(verifyJWT,getTasks);

router.route("/:taskId").get(verifyJWT, getTaskById).patch(verifyJWT,updateTask).delete(verifyJWT,deleteTask);

export default router;