import 'fake-indexeddb/auto';

import { TaskStatus } from '@src/models/Task';
import { exportTasksToJson, importTasksFromJson } from '@src/utils/backup/backup';
import { createTask, createTaskList, getAllTaskLists, getAllTasks } from '@src/utils/todo/todo';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const setupCryptoMock = () => {
  const mockDigest = vi.fn().mockImplementation((_algorithm: string, data: Uint8Array) => {
    const hash = new Uint8Array(32);
    hash[0] = data.length % 256;
    return hash.buffer;
  });

  Object.defineProperty(global, 'crypto', {
    value: {
      subtle: {
        digest: mockDigest,
      },
    },
    writable: true,
  });

  return { mockDigest };
};

describe('Backup - Export', () => {
  beforeEach(() => {
    global.indexedDB = new IDBFactory();
    setupCryptoMock();
  });

  afterEach(async () => {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    }
    vi.clearAllMocks();
  });

  it('should export empty data', async () => {
    const json = await exportTasksToJson();
    const data = JSON.parse(json) as { tasks: unknown[]; taskLists: unknown[] };

    expect(data).toHaveProperty('tasks');
    expect(data).toHaveProperty('taskLists');
    expect(data.tasks).toEqual([]);
    expect(data.taskLists).toEqual([]);
  });

  it('should export tasks and task lists', async () => {
    const list = await createTaskList('List 1', 'Description');
    const task = await createTask('Task 1', list.id, 'Task Description');

    const json = await exportTasksToJson();
    const data = JSON.parse(json) as {
      taskLists: Array<{ id: string; name: string }>;
      tasks: Array<{ id: string; name: string }>;
    };

    expect(data.taskLists).toHaveLength(1);
    expect(data.tasks).toHaveLength(1);
    expect(data.taskLists[0].id).toBe(list.id);
    expect(data.taskLists[0].name).toBe('List 1');
    expect(data.tasks[0].id).toBe(task.id);
    expect(data.tasks[0].name).toBe('Task 1');
  });

  it('should export multiple tasks and lists', async () => {
    const list1 = await createTaskList('List 1');
    const list2 = await createTaskList('List 2');
    await createTask('Task 1', list1.id);
    await createTask('Task 2', list1.id);
    await createTask('Task 3', list2.id);

    const json = await exportTasksToJson();
    const data = JSON.parse(json) as { taskLists: unknown[]; tasks: unknown[] };

    expect(data.taskLists).toHaveLength(2);
    expect(data.tasks).toHaveLength(3);
  });

  it('should export formatted JSON with proper indentation', async () => {
    await createTaskList('List');

    const json = await exportTasksToJson();

    expect(json).toContain('\n');
    expect(json).toContain('  ');
    expect(json).toMatch(/"taskLists":/);
    expect(json).toMatch(/"tasks":/);
  });

  it('should export task with all properties', async () => {
    const list = await createTaskList('List');
    const parent = await createTask('Parent', list.id);
    const child = await createTask('Child', list.id, 'Description', parent.id);

    const json = await exportTasksToJson();
    type ExportedTask = {
      id: string;
      name: string;
      description: string;
      status: TaskStatus;
      parentId: string | null;
      listId: string;
      createdAt: number;
      lastModified: number;
      hash: string;
    };
    const data = JSON.parse(json) as { tasks: ExportedTask[] };
    const exportedChild = data.tasks.find(t => t.id === child.id);

    expect(exportedChild).toMatchObject({
      id: child.id,
      name: 'Child',
      description: 'Description',
      status: TaskStatus.NOT_COMPLETED,
      parentId: parent.id,
      listId: list.id,
    });
    expect(exportedChild).toHaveProperty('createdAt');
    expect(exportedChild).toHaveProperty('lastModified');
    expect(exportedChild).toHaveProperty('hash');
  });
});

describe('Backup - Import', () => {
  beforeEach(() => {
    global.indexedDB = new IDBFactory();
    setupCryptoMock();
  });

  afterEach(async () => {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    }
    vi.clearAllMocks();
  });

  it('should import valid backup data', async () => {
    const list = await createTaskList('List 1');
    const task = await createTask('Task 1', list.id);

    const exported = await exportTasksToJson();

    // Clear database
    await importTasksFromJson(exported, true);

    const lists = await getAllTaskLists();
    const tasks = await getAllTasks();

    expect(lists).toHaveLength(1);
    expect(tasks).toHaveLength(1);
    expect(lists[0].id).toBe(list.id);
    expect(tasks[0].id).toBe(task.id);
  });

  it('should append data when replaceAll is false', async () => {
    const list1 = await createTaskList('Original List');
    await createTask('Original Task', list1.id);

    const newList = {
      id: 'new-list',
      name: 'New List',
      description: '',
      lastModified: Date.now(),
      order: Date.now(),
      hash: 'hash',
    };

    const newTask = {
      id: 'new-task',
      name: 'New Task',
      description: '',
      status: TaskStatus.NOT_COMPLETED,
      createdAt: Date.now(),
      lastModified: Date.now(),
      dueDate: null,
      parentId: null,
      listId: 'new-list',
      order: Date.now(),
      hash: 'hash',
    };

    const backupData = JSON.stringify({
      taskLists: [newList],
      tasks: [newTask],
    });

    await importTasksFromJson(backupData, false);

    const lists = await getAllTaskLists();
    const tasks = await getAllTasks();

    expect(lists.length).toBeGreaterThanOrEqual(2);
    expect(tasks.length).toBeGreaterThanOrEqual(2);
  });

  it('should replace all data when replaceAll is true', async () => {
    await createTaskList('Old List');
    await createTask('Old Task', 'old-list');

    const newList = {
      id: 'new-list',
      name: 'New List',
      description: '',
      lastModified: Date.now(),
      order: Date.now(),
      hash: 'hash',
    };

    const newTask = {
      id: 'new-task',
      name: 'New Task',
      description: '',
      status: TaskStatus.NOT_COMPLETED,
      createdAt: Date.now(),
      lastModified: Date.now(),
      dueDate: null,
      parentId: null,
      listId: 'new-list',
      order: Date.now(),
      hash: 'hash',
    };

    const backupData = JSON.stringify({
      taskLists: [newList],
      tasks: [newTask],
    });

    await importTasksFromJson(backupData, true);

    const lists = await getAllTaskLists();
    const tasks = await getAllTasks();

    expect(lists).toHaveLength(1);
    expect(tasks).toHaveLength(1);
    expect(lists[0].id).toBe('new-list');
    expect(tasks[0].id).toBe('new-task');
  });

  it('should throw error for invalid JSON', async () => {
    await expect(importTasksFromJson('invalid json')).rejects.toThrow('Invalid JSON format');
  });

  it('should throw error for missing tasks array', async () => {
    const invalidData = JSON.stringify({ taskLists: [] });

    await expect(importTasksFromJson(invalidData)).rejects.toThrow(
      'Invalid backup format: missing or malformed tasks or taskLists',
    );
  });

  it('should throw error for missing taskLists array', async () => {
    const invalidData = JSON.stringify({ tasks: [] });

    await expect(importTasksFromJson(invalidData)).rejects.toThrow(
      'Invalid backup format: missing or malformed tasks or taskLists',
    );
  });

  it('should throw error for non-object data', async () => {
    const invalidData = JSON.stringify([]);

    await expect(importTasksFromJson(invalidData)).rejects.toThrow(
      'Invalid backup format: missing or malformed tasks or taskLists',
    );
  });

  it('should handle import errors gracefully and log them', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const invalidBackup = JSON.stringify({
      taskLists: [{ id: null, name: 'Invalid' }],
      tasks: [],
    });

    await importTasksFromJson(invalidBackup);

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should import empty backup successfully', async () => {
    const emptyBackup = JSON.stringify({
      taskLists: [],
      tasks: [],
    });

    await expect(importTasksFromJson(emptyBackup, true)).resolves.not.toThrow();

    const lists = await getAllTaskLists();
    const tasks = await getAllTasks();

    expect(lists).toHaveLength(0);
    expect(tasks).toHaveLength(0);
  });

  it('should handle tasks with parent-child relationships', async () => {
    const list = await createTaskList('List');
    const parent = await createTask('Parent', list.id);
    const child = await createTask('Child', list.id, undefined, parent.id);

    const exported = await exportTasksToJson();

    await importTasksFromJson(exported, true);

    const tasks = await getAllTasks();
    const importedChild = tasks.find(t => t.id === child.id);

    expect(importedChild?.parentId).toBe(parent.id);
  });
});
