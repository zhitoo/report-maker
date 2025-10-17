import express from "express";
import { router as taskRouter } from "./modules/tasks/router.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = 5050;

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

const modulesPath = path.join(__dirname, "modules");

const moduleViewDirs = fs
  .readdirSync(modulesPath)
  .map((m) => path.join(modulesPath, m, "views"))
  .filter((p) => fs.existsSync(p));

app.set("views", [path.join(__dirname, "views"), ...moduleViewDirs]);

app.use((req, res, next) => {
  const start = Date.now();
  next();
  const delta = Date.now() - start;
  console.log(`${req.method} ...... ${req.url} - ${delta}ms`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/tasks", taskRouter);

mongoose
  .connect("mongodb://root:password@localhost:27017/appdb?authSource=admin")
  .then((res) => {
    console.log("connected to db");
    app.listen(PORT, () => {
      console.log(`server start on http://localhost:${PORT}`);
    });
  });
