import { DBSchema, openDB } from 'idb';
import { Task, TaskStatus } from '../../models/Task';

interface T8DDatabase extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: {
      'by-status': TaskStatus;
      'by-parent': string;
      'by-due-date': number;
    };
  };
}

const DB_NAME = 't8d-db1';
const DB_VERSION = 1;

export async function getDB() {
  const dbPromise = await openDB<T8DDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create Object Store
      const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
      taskStore.createIndex('by-status', 'status');
      taskStore.createIndex('by-parent', 'parentId');
      taskStore.createIndex('by-due-date', 'dueDate');
    },
  });

  return dbPromise;
}

// Add a new Task

export async function addTaskToDb(task: Task): Promise<string> {
  const db = await getDB();
  await db.add('tasks', task);
  return task.id;
}

// Fetch/Read Task by Id

export async function getTaskFromDb(id: string): Promise<Task | undefined> {
  const db = await getDB();
  return db.get('tasks', id);
}

// Fetch all Task

export async function getAllTasksFromDb(): Promise<Task[]> {
  const db = await getDB();
  return db.getAll('tasks');
}

// Fetch task by status
export async function getTasksByStatusFromDb(status: TaskStatus): Promise<Task[]> {
  const db = await getDB();
  return db.getAllFromIndex('tasks', 'by-status', status);
}

// Fetch Task by parentId
export async function getTasksByParentFromDb(parentId: string | null): Promise<Task[]> {
  const db = await getDB();
  return db.getAllFromIndex('tasks', 'by-parent', parentId);
}

// Update Task
export async function updateTaskInDb(task: Task): Promise<void> {
  const db = await getDB();
  await db.put('tasks', task);
}

// Delete Task

export async function deleteTaskFromDb(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('tasks', id);
}

// Delete All Task
export async function deleteAllTasksFromDb(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('tasks', 'readwrite');
  await tx.objectStore('tasks').clear();
  await tx.done;
}
