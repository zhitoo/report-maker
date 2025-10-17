import express from "express";

import {
  tasks,
  taskForm,
  storeTask,
  removeTask,
  updateTask,
} from "./controllers/tasks.controller.js";

const router = express.Router();

router.get("/", tasks);
router.get("/form{/:id}", taskForm);
router.post("/", storeTask);
router.post("/:id", updateTask);
router.post("/remove/:id", removeTask);

export { router };
