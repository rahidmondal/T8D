import 'fake-indexeddb/auto';

import { TaskStatus } from '@src/models/Task';
import {
  createTask,
  createTaskList,
  deleteAllTaskLists,
  deleteTask,
  deleteTaskList,
  generateTaskHash,
  generateTaskListHash,
  getAllTaskLists,
  getAllTasks,
  getTask,
  getTasksByList,
  updateTask,
  updateTaskList,
} from '@src/utils/todo/todo';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const setupCryptoMock = () => {
  const mockDigest = vi.fn().mockImplementation((_algorithm: string, data: Uint8Array) => {
    let hashValue = 0;
    for (let i = 0; i < data.length; i++) {
      hashValue = (hashValue << 5) - hashValue + data[i];
      hashValue = hashValue & hashValue;
    }
    const hash = new Uint8Array(32);
    hash[0] = (hashValue >> 24) & 0xff;
    hash[1] = (hashValue >> 16) & 0xff;
    hash[2] = (hashValue >> 8) & 0xff;
    hash[3] = hashValue & 0xff;
    return Promise.resolve(hash.buffer);
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

describe('Todo - Hash Generation', () => {
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

  it('should generate consistent hash for task', async () => {
    const taskData = {
      id: 'task-1',
      name: 'Task',
      description: 'Description',
      status: TaskStatus.NOT_COMPLETED,
      createdAt: 1000,
      lastModified: 2000,
      dueDate: null,
      parentId: null,
      listId: 'list-1',
      order: 1000,
    };

    const hash1 = await generateTaskHash(taskData);
    const hash2 = await generateTaskHash(taskData);

    expect(hash1).toBe(hash2);
    expect(hash1).toBeDefined();
    expect(typeof hash1).toBe('string');
  });

  it('should generate different hash for different task data', async () => {
    const taskData1 = {
      id: 'task-1',
      name: 'Task 1',
      description: '',
      status: TaskStatus.NOT_COMPLETED,
      createdAt: 1000,
      lastModified: 2000,
      dueDate: null,
      parentId: null,
      listId: 'list-1',
      order: 1000,
    };

    const taskData2 = {
      ...taskData1,
      name: 'Task 2',
    };

    const hash1 = await generateTaskHash(taskData1);
    const hash2 = await generateTaskHash(taskData2);

    expect(hash1).not.toBe(hash2);
  });

  it('should generate consistent hash for task list', async () => {
    const listData = {
      id: 'list-1',
      name: 'List',
      description: 'Description',
      lastModified: 1000,
      order: 1000,
    };

    const hash1 = await generateTaskListHash(listData);
    const hash2 = await generateTaskListHash(listData);

    expect(hash1).toBe(hash2);
  });
});

describe('Todo - Task Operations', () => {
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

  it('should create a task with generated id and hash', async () => {
    const task = await createTask('New Task', 'list-1', 'Description');

    expect(task.id).toBeDefined();
    expect(task.name).toBe('New Task');
    expect(task.description).toBe('Description');
    expect(task.listId).toBe('list-1');
    expect(task.status).toBe(TaskStatus.NOT_COMPLETED);
    expect(task.hash).toBeDefined();
    expect(task.parentId).toBeNull();
    expect(task.createdAt).toBeDefined();
    expect(task.lastModified).toBeDefined();
  });

  it('should create a task with parent', async () => {
    const parentTask = await createTask('Parent', 'list-1');
    const childTask = await createTask('Child', 'list-1', undefined, parentTask.id);

    expect(childTask.parentId).toBe(parentTask.id);
  });

  it('should create a task with custom order', async () => {
    const customOrder = 12345;
    const task = await createTask('Task', 'list-1', undefined, null, customOrder);

    expect(task.order).toBe(customOrder);
  });

  it('should update a task and regenerate hash', async () => {
    const task = await createTask('Task', 'list-1');
    const originalModified = task.lastModified;

    await new Promise(resolve => setTimeout(resolve, 10));

    await updateTask(task.id, { name: 'Updated Task' });

    const updated = await getTask(task.id);
    expect(updated?.name).toBe('Updated Task');
    expect(updated?.lastModified).toBeGreaterThan(originalModified);
    expect(updated?.hash).toBeDefined();
  });

  it('should mark task and children as completed when parent is completed', async () => {
    const parent = await createTask('Parent', 'list-1');
    const child1 = await createTask('Child 1', 'list-1', undefined, parent.id);
    const child2 = await createTask('Child 2', 'list-1', undefined, parent.id);

    await updateTask(parent.id, { status: TaskStatus.COMPLETED });

    const updatedParent = await getTask(parent.id);
    const updatedChild1 = await getTask(child1.id);
    const updatedChild2 = await getTask(child2.id);

    expect(updatedParent?.status).toBe(TaskStatus.COMPLETED);
    expect(updatedChild1?.status).toBe(TaskStatus.COMPLETED);
    expect(updatedChild2?.status).toBe(TaskStatus.COMPLETED);
  });

  it('should throw error when updating non-existent task', async () => {
    await expect(updateTask('non-existent', { name: 'Test' })).rejects.toThrow('Task with id non-existent not found');
  });

  it('should delete task and reassign incomplete children to parent', async () => {
    const parent = await createTask('Parent', 'list-1');
    const completedChild = await createTask('Completed Child', 'list-1', undefined, parent.id);
    const incompleteChild = await createTask('Incomplete Child', 'list-1', undefined, parent.id);

    await updateTask(completedChild.id, { status: TaskStatus.COMPLETED });

    await deleteTask(parent.id);

    const deletedParent = await getTask(parent.id).catch(() => undefined);
    const deletedCompleted = await getTask(completedChild.id).catch(() => undefined);
    const orphanedChild = await getTask(incompleteChild.id);

    expect(deletedParent).toBeUndefined();
    expect(deletedCompleted).toBeUndefined();
    expect(orphanedChild).toBeDefined();
    expect(orphanedChild?.parentId).toBeNull();
  });

  it('should handle deleting non-existent task gracefully', async () => {
    await expect(deleteTask('non-existent')).resolves.not.toThrow();
  });

  it('should get all tasks', async () => {
    await createTask('Task 1', 'list-1');
    await createTask('Task 2', 'list-1');
    await createTask('Task 3', 'list-2');

    const tasks = await getAllTasks();
    expect(tasks).toHaveLength(3);
  });

  it('should get tasks by list', async () => {
    await createTask('Task 1', 'list-1');
    await createTask('Task 2', 'list-2');
    await createTask('Task 3', 'list-1');

    const list1Tasks = await getTasksByList('list-1');
    expect(list1Tasks).toHaveLength(2);
    expect(list1Tasks.every(t => t.listId === 'list-1')).toBe(true);
  });

  it('should throw error when getting non-existent task', async () => {
    await expect(getTask('non-existent')).rejects.toThrow('Task with id non-existent not found');
  });
});

describe('Todo - TaskList Operations', () => {
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

  it('should create a task list with generated id and hash', async () => {
    const list = await createTaskList('New List', 'Description');

    expect(list.id).toBeDefined();
    expect(list.name).toBe('New List');
    expect(list.description).toBe('Description');
    expect(list.hash).toBeDefined();
    expect(list.lastModified).toBeDefined();
    expect(list.order).toBeDefined();
  });

  it('should create a task list without description', async () => {
    const list = await createTaskList('List Without Description');

    expect(list.description).toBe('');
  });

  it('should update a task list and regenerate hash', async () => {
    const list = await createTaskList('List');
    const originalModified = list.lastModified;

    await new Promise(resolve => setTimeout(resolve, 10));

    const updated = await updateTaskList(list.id, { name: 'Updated List' });

    expect(updated.name).toBe('Updated List');
    expect(updated.lastModified).toBeGreaterThan(originalModified);
    expect(updated.hash).toBeDefined();
  });

  it('should throw error when updating non-existent list', async () => {
    await expect(updateTaskList('non-existent', { name: 'Test' })).rejects.toThrow(
      'Task list with id non-existent not found',
    );
  });

  it('should delete task list and all its tasks', async () => {
    const list = await createTaskList('List');
    await createTask('Task 1', list.id);
    await createTask('Task 2', list.id);
    await createTask('Task 3', list.id);

    await deleteTaskList(list.id);

    const tasks = await getTasksByList(list.id);
    expect(tasks).toHaveLength(0);
  });

  it('should get all task lists', async () => {
    await createTaskList('List 1');
    await createTaskList('List 2');
    await createTaskList('List 3');

    const lists = await getAllTaskLists();
    expect(lists).toHaveLength(3);
  });

  it('should delete all task lists and tasks', async () => {
    const list1 = await createTaskList('List 1');
    const list2 = await createTaskList('List 2');
    await createTask('Task 1', list1.id);
    await createTask('Task 2', list2.id);
    await createTask('Task 3', list1.id);

    await deleteAllTaskLists();

    const lists = await getAllTaskLists();
    const tasks = await getAllTasks();

    expect(lists).toHaveLength(0);
    expect(tasks).toHaveLength(0);
  });
});
