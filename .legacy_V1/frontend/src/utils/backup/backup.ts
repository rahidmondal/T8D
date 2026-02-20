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

  for (const list of parsed.taskLists) {
    try {
      await addTaskListToDb(list);
    } catch (error) {
      console.error(`Failed to import task list with id ${list.id}:`, error);
    }
  }

  for (const task of parsed.tasks) {
    try {
      await addTaskToDb(task);
    } catch (error) {
      console.error(`Failed to import task with id ${task.id}:`, error);
    }
  }
}
