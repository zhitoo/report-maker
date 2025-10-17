import path from "path";
import Task from "../models/task.model.js";
import { marked } from "marked";

async function tasks(req, res) {
  const now = new Date();

  const sevenDaysAgo = new Date();

  const q = req.query.q?.trim();

  const d = req.query.d?.trim() || 7;

  sevenDaysAgo.setDate(now.getDate() - d);

  let filter = {
    created_at: { $gte: sevenDaysAgo, $lte: now },
  };

  if (q) {
    filter.$or = [
      { tag: { $regex: q, $options: "i" } },
      { project: { $regex: q, $options: "i" } },
    ];
  }

  const tasks = await Task.find(filter).sort({ created_at: -1 });

  const totalTime = tasks.reduce((sum, task) => sum + task.time, 0);

  let timeByTag = tasks.reduce((acc, task) => {
    if (task.tag) {
      acc[task.tag] = (acc[task.tag] || 0) + task.time;
    }
    return acc;
  }, {});

  timeByTag = Object.entries(timeByTag)
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, [tag, time]) => {
      acc[tag] = time;
      return acc;
    }, {});

  let timeByProject = tasks.reduce((acc, task) => {
    if (task.project) {
      acc[task.project] = (acc[task.project] || 0) + task.time;
    }
    return acc;
  }, {});

  timeByProject = Object.entries(timeByProject)
    .sort((a, b) => b[1] - a[1])
    .reduce((acc, [project, time]) => {
      acc[project] = time;
      return acc;
    }, {});

  const totalScore = tasks.reduce((sum, t) => sum + (t.score || 0), 0);
  const avgScore =
    tasks.length > 0 ? (totalScore / tasks.length).toFixed(2) : 0;

  tasks.forEach((task) => {
    if (task.description) {
      task.descriptionHtml = marked.parse(task.description);
    }
  });
  console.log(q);
  res.render(path.join("..", "views", "tasks"), {
    title: "Report",
    tasks: tasks,
    totalTime,
    timeByTag,
    timeByProject,
    avgScore,
    q,
  });
}

async function taskForm(req, res) {
  console.log("here");
  let id = req.params.id;
  let title = "Create New";
  let submitFormUrl = "/tasks";
  let t = null;
  if (id) {
    title = "Update Task " + id;
    t = await Task.findOne({ _id: id });
    submitFormUrl = "/tasks/" + id;
  }
  res.render(path.join("..", "views", "taskForm"), {
    title: title,
    submitFormUrl: submitFormUrl,
    task: t,
  });
}

async function storeTask(req, res) {
  const body = req.body;
  const backURL = req.header("Referer") || "/";
  let task = new Task({
    project: body.project,
    title: body.title,
    task_number: body.task_number,
    time: body.time,
    tag: body.tag,
    score: body.score,
    created_at: new Date(),
    description: body.description,
  });
  task.save();
  res.redirect(backURL);
}

async function updateTask(req, res) {
  const body = req.body;
  const id = req.params.id;
  const backURL = req.header("Referer") || "/";
  await Task.findByIdAndUpdate(
    { _id: id },
    {
      project: body.project,
      title: body.title,
      task_number: body.task_number,
      time: body.time,
      tag: body.tag,
      score: body.score,
      description: body.description,
    }
  );
  res.redirect(backURL);
}

async function removeTask(req, res) {
  const id = req.params.id;
  const backURL = req.header("Referer") || "/";
  await Task.deleteOne({ _id: id });
  res.redirect(backURL);
}

export { tasks, taskForm, storeTask, updateTask, removeTask };
