export type Task = { id: number; title: string; done: boolean };

export class TaskRepository {
  private tasks: Task[] = [];
  private nextId = 1;

  findAll() { return this.tasks; }
  findById(id: number) { return this.tasks.find(t => t.id === id); }

  create(title: string): Task {
    const task = { id: this.nextId++, title, done: false };
    this.tasks.push(task);
    return task;
  }

  update(id: number, data: Partial<Omit<Task, "id">>) {
    const task = this.findById(id);
    if (task) Object.assign(task, data);
    return task;
  }

  delete(id: number) {
    const i = this.tasks.findIndex(t => t.id === id);
    if (i === -1) return false;
    this.tasks.splice(i, 1);
    return true;
  }
}