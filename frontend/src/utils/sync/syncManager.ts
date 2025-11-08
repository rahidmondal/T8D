import { Task } from '@src/models/Task';
import { TaskList } from '@src/models/TaskList';

import { getSyncEnabled } from './syncSettings';

export const pushTaskChange = async (task: Task): Promise<void> => {
  if (!getSyncEnabled()) return;

  await Promise.resolve();
  console.info('SyncManager: Task change detected (Sync Enabled)', task.id);
};

export const pushTaskDelete = async (taskId: string): Promise<void> => {
  if (!getSyncEnabled()) return;

  await Promise.resolve();
  console.info('SyncManager: Task deletion detected (Sync Enabled)', taskId);
};

export const pushListChange = async (list: TaskList): Promise<void> => {
  if (!getSyncEnabled()) return;

  await Promise.resolve();
  console.info('SyncManager: List change detected (Sync Enabled)', list.id);
};

export const pushListDelete = async (listId: string): Promise<void> => {
  if (!getSyncEnabled()) return;

  await Promise.resolve();
  console.info('SyncManager: List deletion detected (Sync Enabled)', listId);
};
