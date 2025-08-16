import { Task, TaskStatus } from '@src/models/Task';
import { exportTasksToJson, importTasksFromJson } from '@src/utils/backup/backup';
import { addTaskToDb, deleteAllTasksFromDb, getAllTasksFromDb } from '@src/utils/database/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sampleTask: Task = {
  id: 'test-id',
  name: 'Test Task',
  description: 'A test task',
  status: TaskStatus.NOT_COMPLETED,
  createdAt: Date.now(),
  lastModified: Date.now(),
  dueDate: null,
  parentId: null,
  hash: 'test-hash',
};

describe('backup utils', () => {
  beforeEach(async () => {
    await deleteAllTasksFromDb();
  });

  it('should export tasks to JSON', async () => {
    await addTaskToDb(sampleTask);
    const json = await exportTasksToJson();
    const tasks = JSON.parse(json) as Task[];
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe(sampleTask.id);
  });

  it('should import tasks from JSON (merge/update)', async () => {
    await addTaskToDb({ ...sampleTask, name: 'Old Name' });
    const updatedTask = { ...sampleTask, name: 'New Name' };
    const json = JSON.stringify([updatedTask]);
    await importTasksFromJson(json, false);
    const tasks = await getAllTasksFromDb();
    expect(tasks.length).toBe(1);
    expect(tasks[0].name).toBe('New Name');
  });

  it('should import tasks from JSON (replaceAll)', async () => {
    await addTaskToDb({ ...sampleTask, id: 'old-id', name: 'Old Task' });
    const json = JSON.stringify([sampleTask]);
    await importTasksFromJson(json, true);
    const tasks = await getAllTasksFromDb();
    expect(tasks.length).toBe(1);
    expect(tasks[0].id).toBe(sampleTask.id);
  });

  it('should throw error for invalid JSON', async () => {
    await expect(importTasksFromJson('not a json')).rejects.toThrow('Invalid JSON format');
  });

  it('should throw error for non-array JSON', async () => {
    await expect(importTasksFromJson('{}')).rejects.toThrow('Invalid format: not an array');
  });

  it('should handle addTaskToDb errors gracefully', async () => {
    const brokenTask = { ...sampleTask, id: undefined as unknown as string };
    const json = JSON.stringify([brokenTask]);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await importTasksFromJson(json);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
