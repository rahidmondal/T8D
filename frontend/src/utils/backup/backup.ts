import { Task } from '@src/models/Task';

import {
  addTaskToDb,
  deleteAllTasksFromDb,
  getAllTasksFromDb,
  getTaskFromDb,
  updateTaskInDb,
} from '../database/database';

export async function exportTasksToJson(): Promise<string> {
  const tasks = await getAllTasksFromDb();
  return JSON.stringify(tasks, null, 2);
}

export async function importTasksFromJson(jsonString: string, replaceAll = false): Promise<void> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON format');
  }
  if (!Array.isArray(parsed)) {
    throw new Error('Invalid format: not an array');
  }
  const tasks = parsed as Task[];

  if (replaceAll) {
    await deleteAllTasksFromDb();
  }

  for (const task of tasks) {
    try {
      const existing = await getTaskFromDb(task.id);
      if (existing) {
        await updateTaskInDb(task);
      } else {
        await addTaskToDb(task);
      }
    } catch (error) {
      console.error(`Failed to import task with id ${task.id}:`, error);
    }
  }
}
