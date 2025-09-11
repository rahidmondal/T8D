import { Task } from '@src/models/Task';
import { TaskList } from '@src/models/TaskList';

import {
  addTaskListToDb,
  addTaskToDb,
  deleteAllTaskListsFromDb,
  deleteAllTasksFromDb,
  getAllTaskListsFromDb,
  getAllTasksFromDb,
} from '../database/database';

interface BackupData {
  taskLists: TaskList[];
  tasks: Task[];
}

function isBackupData(data: unknown): data is BackupData {
  const potentialBackup = data as BackupData;
  return (
    typeof potentialBackup === 'object' &&
    Array.isArray(potentialBackup.tasks) &&
    Array.isArray(potentialBackup.taskLists)
  );
}

export async function exportTasksToJson(): Promise<string> {
  const tasks = await getAllTasksFromDb();
  const taskLists = await getAllTaskListsFromDb();
  const backupData: BackupData = { taskLists, tasks };
  return JSON.stringify(backupData, null, 2);
}

export async function importTasksFromJson(jsonString: string, replaceAll = false): Promise<void> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON format');
  }

  if (!isBackupData(parsed)) {
    throw new Error('Invalid backup format: missing or malformed tasks or taskLists');
  }

  if (replaceAll) {
    await deleteAllTasksFromDb();
    await deleteAllTaskListsFromDb();
  }

  // Import Task Lists
  for (const list of parsed.taskLists) {
    try {
      // A simple add is used. If a list with the same ID exists, IndexedDB will throw an error.
      // For a more robust import, one might check for existing lists and update them.
      await addTaskListToDb(list);
    } catch (error) {
      console.error(`Failed to import task list with id ${list.id}:`, error);
    }
  }
  for (const task of parsed.tasks) {
    try {
      // Similar to lists, this uses a simple add operation.
      await addTaskToDb(task);
    } catch (error) {
      console.error(`Failed to import task with id ${task.id}:`, error);
    }
  }
}
