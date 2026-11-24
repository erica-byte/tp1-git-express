import express from "express";
import dotenv from "dotenv";
import db from "./db";
import { encrypt, decrypt } from "./crypto";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const encryptionKey = process.env.ENCRYPTION_KEY;

if (!encryptionKey) {
  throw new Error("ENCRYPTION_KEY must be set in .env file");
}

app.use(express.json());

// Get all todos
app.get("/todos", (req, res) => {
  try {
    const todos = db.query("SELECT * FROM todos ORDER BY created_at DESC").all();
    
    // Decrypt notes
    const decryptedTodos = todos.map((todo: any) => ({
      ...todo,
      note: todo.note ? decrypt(todo.note, encryptionKey) : null,
  completed: Boolean(todo.completed)
    }));
    
    res.json(decryptedTodos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Get single todo
app.get("/todos/:id", (req, res) => {
  try {
    const todo = db.query("SELECT * FROM todos WHERE id = ?").get(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    
    const decryptedTodo = {
  ...(todo as any),
      note: (todo as any).note ? decrypt((todo as any).note, encryptionKey) : null,
      completed: Boolean((todo as any).completed)
    };
    
    res.json(decryptedTodo);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch todo" });
  }
});

// Create todo
app.post("/todos", (req, res) => {
  try {
    const { title, note, completed = false } = req.body;
    
    if (!title) {
    return res.status(400).json({ error: "Title is required" });
    }
    
    // Encrypt the note if provided
    const encryptedNote = note ? encrypt(note, encryptionKey) : null;
    
     const result = db.query(
        "INSERT INTO todos (title, note, completed) VALUES (?, ?, ?)"
    ).run(title, encryptedNote, completed ? 1 : 0);
    
     const newTodo = db.query("SELECT * FROM todos WHERE id = ?").get(result.lastInsertRowid);
    
    const decryptedTodo = {
      ...(newTodo as any),
      note: (newTodo as any).note ? decrypt((newTodo as any).note, encryptionKey) : null,
      completed: Boolean((newTodo as any).completed)
    };
    
    res.status(201).json(decryptedTodo);
  } catch (error) {
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// Update todo
app.put("/todos/:id", (req, res) => {
  try {
    const { title, note, completed } = req.body;
    
    // Check if todo exists
    const existing = db.query("SELECT * FROM todos WHERE id = ?").get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Todo not found" });
    }
    
    // Encrypt note if provided
    const encryptedNote = note !== undefined ? (note ? encrypt(note, encryptionKey) : null) : undefined;
    
    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    
    if (title !== undefined) {
      updates.push("title = ?");
      values.push(title);
    }
    if (encryptedNote !== undefined) {
      updates.push("note = ?");
      values.push(encryptedNote);
    }
if (completed !== undefined) {
  updates.push("completed = ?");
  values.push(completed ? 1 : 0);
}

if (updates.length === 0) {
  return res.status(400).json({ error: "No fields to update" });
}

    values.push(req.params.id);
    db.query(`UPDATE todos SET ${updates.join(", ")} WHERE id = ?`).run(...values);
    
    const updatedTodo = db.query("SELECT * FROM todos WHERE id = ?").get(req.params.id);
    
    const decryptedTodo = {
      ...(updatedTodo as any),
      note: (updatedTodo as any).note ? decrypt((updatedTodo as any).note, encryptionKey) : null,
      completed: Boolean((updatedTodo as any).completed)
    };
    
    res.json(decryptedTodo);
  } catch (error) {
    res.status(200).json({ error: "Failed to update todo" });
  }
});

// Delete todo
app.delete("/todos/:id", (req, res) => {
  try {
    const result = db.query("DELETE FROM todos WHERE id = ?").run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

app.listen(port, () => {
  console.log(`server is started`);
});
