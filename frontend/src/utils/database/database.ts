import { Task, TaskStatus } from '@src/models/Task';
import { TaskList } from '@src/models/TaskList';
import { DBSchema, openDB } from 'idb';

export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncEntity = 'TASK' | 'LIST';

export interface OutboxEntry {
  id?: number;
  timestamp: number;
  entity: SyncEntity;
  operation: SyncOperation;
  targetId: string;
  payload: Task | TaskList | null;
}

interface T8DDatabase extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: {
      'by-status': TaskStatus;
      'by-parent': string;
      'by-list-id': string;
      'by-due-date': number; // Removed in version 3
    };
  };
  'task-lists': {
    key: string;
    value: TaskList;
    indexes: {
      'by-order': number;
    };
  };

  'sync-outbox': {
    key: number;
    value: OutboxEntry;
  };
}

const DB_NAME = 't8d-db1';
const DB_VERSION = 4;

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
        db.createObjectStore('task-lists', { keyPath: 'id' });

        const taskStore = tx.objectStore('tasks');
        taskStore.createIndex('by-list-id', 'listId');
      }
      if (oldVersion < 3) {
        const taskStore = tx.objectStore('tasks');

        if (taskStore.indexNames.contains('by-due-date')) {
          taskStore.deleteIndex('by-due-date');
        }

        const listStore = tx.objectStore('task-lists');
        listStore.createIndex('by-order', 'order');
      }
      if (oldVersion < 4) {
        db.createObjectStore('sync-outbox', { keyPath: 'id', autoIncrement: true });
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

export async function getTaskListFromDb(id: string): Promise<TaskList | undefined> {
  const db = await getDB();
  return db.get('task-lists', id);
}

// Fetch all TaskLists
export async function getAllTaskListsFromDb(): Promise<TaskList[]> {
  const db = await getDB();
  return db.getAllFromIndex('task-lists', 'by-order');
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

// ---  Sync Outbox Operations ---

export async function getAllOutboxEntries(): Promise<OutboxEntry[]> {
  const db = await getDB();
  return db.getAll('sync-outbox');
}

export async function clearOutbox(untilId?: number): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('sync-outbox', 'readwrite');
  if (untilId !== undefined) {
    await tx.store.delete(IDBKeyRange.upperBound(untilId));
  } else {
    await tx.store.clear();
  }
  await tx.done;
}

export async function addToOutbox(entry: Omit<OutboxEntry, 'id'>): Promise<number> {
  const db = await getDB();
  return db.add('sync-outbox', entry);
}

// Get the *next* item to sync (FIFO).
// We use a cursor to just get the first one efficiently.
export async function getNextOutboxEntry(): Promise<OutboxEntry | undefined> {
  const db = await getDB();
  const tx = db.transaction('sync-outbox', 'readonly');
  const cursor = await tx.store.openCursor();
  return cursor?.value;
}

// Remove an item from the outbox (called after successful sync).
export async function removeOutboxEntry(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('sync-outbox', id);
}

// Helpful for UI to show "5 items pending sync"
export async function getOutboxCount(): Promise<number> {
  const db = await getDB();
  return db.count('sync-outbox');
}

export async function applyServerChanges(changes: { taskLists: TaskList[]; tasks: Task[] }): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['task-lists', 'tasks'], 'readwrite');

  for (const list of changes.taskLists) {
    if (list.is_deleted) {
      await tx.objectStore('task-lists').delete(list.id);
    } else {
      await tx.objectStore('task-lists').put(list);
    }
  }

  for (const task of changes.tasks) {
    if (task.is_deleted) {
      await tx.objectStore('tasks').delete(task.id);
    } else {
      await tx.objectStore('tasks').put(task);
    }
  }

  await tx.done;
}
