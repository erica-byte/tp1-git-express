import express from "express";
import { TaskRepository } from "./taskRepository.ts";

const app = express();
app.use(express.json());
const repo = new TaskRepository();

app.get("/tasks", (req, res) => {
  res.json(repo.findAll());
});

app.get("/tasks/:id", (req, res) => {
  const task = repo.findById(Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

app.post("/tasks", (req, res) => {
  const { title } = req.body ?? {};
  if (!title) return res.status(400).json({ error: "title is required" });
  res.status(201).json(repo.create(title));
});

app.patch("/tasks/:id", (req, res) => {
  const { title, done } = req.body ?? {};
  if (title !== undefined && !title) return res.status(400).json({ error: "title cannot be empty" });
  const task = repo.update(Number(req.params.id), { title, done });
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

app.delete("/tasks/:id", (req, res) => {
  if (!repo.delete(Number(req.params.id))) return res.status(404).json({ error: "Task not found" });
  res.status(204).send();
});

app.listen(3000, () => console.log("API sur http://localhost:3000"));