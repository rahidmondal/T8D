import { Task, TaskStatus } from '@src/models/Task';
import { TaskList } from '@src/models/TaskList';
import { DBSchema, openDB } from 'idb';

interface T8DDatabase extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: {
      'by-status': TaskStatus;
      'by-parent': string;
      'by-due-date': number;
      'by-list-id': string;
    };
  };
  'task-lists': {
    key: string;
    value: TaskList;
  };
}

const DB_NAME = 't8d-db1';
const DB_VERSION = 2;

export async function getDB() {
  const dbPromise = await openDB<T8DDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, _newVersion, tx) {
      if (oldVersion < 1) {
        // Create Object Store for tasks
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-status', 'status');
        taskStore.createIndex('by-parent', 'parentId');
        taskStore.createIndex('by-due-date', 'dueDate');
      }
      if (oldVersion < 2) {
        // Create Object Store for task lists
        db.createObjectStore('task-lists', { keyPath: 'id' });
        // Add new index to tasks store
        const taskStore = tx.objectStore('tasks');
        taskStore.createIndex('by-list-id', 'listId');
      }
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

// Fetch Task by listId
export async function getTasksByListIdFromDb(listId: string): Promise<Task[]> {
  const db = await getDB();
  return db.getAllFromIndex('tasks', 'by-list-id', listId);
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

// Task List Operations
// Add a new TaskList
export async function addTaskListToDb(list: TaskList): Promise<string> {
  const db = await getDB();
  await db.add('task-lists', list);
  return list.id;
}

// Fetch all TaskLists
export async function getAllTaskListsFromDb(): Promise<TaskList[]> {
  const db = await getDB();
  return db.getAll('task-lists');
}

// Update TaskList
export async function updateTaskListInDb(list: TaskList): Promise<void> {
  const db = await getDB();
  await db.put('task-lists', list);
}

// Delete TaskList
export async function deleteTaskListFromDb(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('task-lists', id);
}

// Delete all TaskLists
export async function deleteAllTaskListsFromDb(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('task-lists', 'readwrite');
  await tx.objectStore('task-lists').clear();
  await tx.done;
}
