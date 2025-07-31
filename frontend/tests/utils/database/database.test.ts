import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { Task, TaskStatus } from '../../../src/models/Task';
import {
  addTaskToDb,
  deleteAllTasksFromDb,
  deleteTaskFromDb,
  getAllTasksFromDb,
  getTaskFromDb,
  getTasksByParentFromDb,
  getTasksByStatusFromDb,
  updateTaskInDb,
} from '../../../src/utils/database/database';

// Mock Task data
const now = Date.now();
const mockTask: Task = {
  id: '1',
  name: 'Test Task',
  description: 'A test task',
  status: TaskStatus.NOT_COMPLETED,
  createdAt: now,
  lastModified: now,
  dueDate: now + 10000,
  parentId: null,
  hash: 'hash1',
  metadata: {},
};

const anotherTask: Task = {
  id: '2',
  name: 'Another Task',
  description: 'Another test task',
  status: TaskStatus.WORKING,
  createdAt: now,
  lastModified: now,
  dueDate: now + 20000,
  parentId: '1',
  hash: 'hash2',
  metadata: {},
};

describe('database utils', () => {
  beforeEach(async () => {
    await deleteAllTasksFromDb();
  });

  afterEach(async () => {
    await deleteAllTasksFromDb();
  });

  test('addTaskToDb and getTaskFromDb', async () => {
    await addTaskToDb(mockTask);
    const task = await getTaskFromDb(mockTask.id);
    expect(task).toBeDefined();
    expect(task?.name).toBe(mockTask.name);
  });

  test('getAllTasksFromDb', async () => {
    await addTaskToDb(mockTask);
    await addTaskToDb(anotherTask);
    const tasks = await getAllTasksFromDb();
    expect(tasks.length).toBe(2);
  });

  test('getTasksByStatusFromDb', async () => {
    await addTaskToDb(mockTask);
    await addTaskToDb(anotherTask);
    const notCompletedTasks = await getTasksByStatusFromDb(TaskStatus.NOT_COMPLETED);
    expect(notCompletedTasks.length).toBe(1);
    expect(notCompletedTasks[0].status).toBe(TaskStatus.NOT_COMPLETED);
  });

  test('getTasksByParentFromDb', async () => {
    await addTaskToDb(mockTask);
    await addTaskToDb(anotherTask);
    const childTasks = await getTasksByParentFromDb('1');
    expect(childTasks.length).toBe(1);
    expect(childTasks[0].parentId).toBe('1');
  });

  test('updateTaskInDb', async () => {
    await addTaskToDb(mockTask);
    const updatedTask = { ...mockTask, name: 'Updated Task' };
    await updateTaskInDb(updatedTask);
    const task = await getTaskFromDb(mockTask.id);
    expect(task?.name).toBe('Updated Task');
  });

  test('deleteTaskFromDb', async () => {
    await addTaskToDb(mockTask);
    await deleteTaskFromDb(mockTask.id);
    const task = await getTaskFromDb(mockTask.id);
    expect(task).toBeUndefined();
  });

  test('deleteAllTasksFromDb', async () => {
    await addTaskToDb(mockTask);
    await addTaskToDb(anotherTask);
    await deleteAllTasksFromDb();
    const tasks = await getAllTasksFromDb();
    expect(tasks.length).toBe(0);
  });
});
