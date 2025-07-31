import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { TaskStatus } from '../../../src/models/Task';
import { deleteAllTasksFromDb } from '../../../src/utils/database/database';
import { createTask, deleteTask, getAllTasks, getTask, updateTask } from '../../../src/utils/todo/todo';

describe('todo utils', () => {
  beforeEach(async () => {
    await deleteAllTasksFromDb();
  });

  afterEach(async () => {
    await deleteAllTasksFromDb();
  });

  test('createTask should create and return a new task', async () => {
    const task = await createTask('Test Task', 'A test description');
    expect(task).toBeDefined();
    expect(task.name).toBe('Test Task');
    expect(task.description).toBe('A test description');
    expect(task.status).toBe(TaskStatus.NOT_COMPLETED);
    expect(task.id).toBeDefined();
    expect(task.hash).toBeDefined();
  });

  test('getTask should retrieve a created task', async () => {
    const task = await createTask('Test Task');
    const fetched = await getTask(task.id);
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(task.id);
    expect(fetched?.name).toBe('Test Task');
  });

  test('getAllTasks should return all created tasks', async () => {
    await createTask('Task 1');
    await createTask('Task 2');
    const tasks = await getAllTasks();
    expect(tasks.length).toBe(2);
    const names = tasks.map(t => t.name);
    expect(names).toContain('Task 1');
    expect(names).toContain('Task 2');
  });

  test('updateTask should update an existing task', async () => {
    const task = await createTask('Task to Update');
    await updateTask(task.id, { name: 'Updated Task', status: TaskStatus.COMPLETED });
    const updated = await getTask(task.id);
    expect(updated?.name).toBe('Updated Task');
    expect(updated?.status).toBe(TaskStatus.COMPLETED);
    expect(updated?.lastModified).toBeGreaterThan(task.lastModified);
    expect(updated?.hash).not.toBe(task.hash);
  });

  test('deleteTask should remove a task', async () => {
    const task = await createTask('Task to Delete');
    await deleteTask(task.id);
    await expect(getTask(task.id)).rejects.toThrow(`Task with id ${task.id} not found`);
  });

  test('getTask should throw if task does not exist', async () => {
    await expect(getTask('non-existent-id')).rejects.toThrow('Task with id non-existent-id not found');
  });

  test('updateTask should throw if task does not exist', async () => {
    await expect(updateTask('non-existent-id', { name: 'Nope' })).rejects.toThrow(
      'Task with id non-existent-id not found',
    );
  });

  test('deleteTask should throw if task does not exist', async () => {
    await expect(deleteTask('non-existent-id')).rejects.toThrow('Task with id non-existent-id not found');
  });
});
