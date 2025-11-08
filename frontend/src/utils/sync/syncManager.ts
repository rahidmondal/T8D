import { Task } from '@src/models/Task';
import { TaskList } from '@src/models/TaskList';

import { addToOutbox } from '../database/database';

import { getSyncEnabled } from './syncSettings';

const safelyExecute = async (operationName: string, operation: () => Promise<void>) => {
  if (!getSyncEnabled()) {
    return;
  }

  try {
    await operation();
  } catch (error) {
    console.error(`SyncManager Error [${operationName}]:`, error);
  }
};

// --- Push Operations (Sending changes to outbox) ---

export const pushTaskChange = async (task: Task): Promise<void> => {
  await safelyExecute('pushTaskChange', async () => {
    // We use 'UPDATE' as a generic "UPSERT" operation because we are sending the full object.
    // Note: Although the SyncOperation type includes a separate 'CREATE' operation,
    // this implementation uses 'UPDATE' for both creation and update (upsert).
    // The backend is expected to create the entity if it does not exist, and update it otherwise.
    await addToOutbox({
      timestamp: Date.now(),
      entity: 'TASK',
      operation: 'UPDATE',
      targetId: task.id,
      payload: task,
    });
    console.info('[SyncManager] Queued task change:', task.id);
  });
};

export const pushTaskDelete = async (taskId: string): Promise<void> => {
  await safelyExecute('pushTaskDelete', async () => {
    await addToOutbox({
      timestamp: Date.now(),
      entity: 'TASK',
      operation: 'DELETE',
      targetId: taskId,
      payload: null,
    });
    console.info('[SyncManager] Queued task deletion:', taskId);
  });
};

export const pushListChange = async (list: TaskList): Promise<void> => {
  await safelyExecute('pushListChange', async () => {
    await addToOutbox({
      timestamp: Date.now(),
      entity: 'LIST',
      operation: 'UPDATE',
      targetId: list.id,
      payload: list,
    });
    console.info('[SyncManager] Queued list change:', list.id);
  });
};

export const pushListDelete = async (listId: string): Promise<void> => {
  await safelyExecute('pushListDelete', async () => {
    await addToOutbox({
      timestamp: Date.now(),
      entity: 'LIST',
      operation: 'DELETE',
      targetId: listId,
      payload: null,
    });
    console.info('[SyncManager] Queued list deletion:', listId);
  });
};

// --- Pull Operations ---

export const pullChanges = async (): Promise<void> => {
  await safelyExecute('pullChanges', async () => {
    console.info('[SyncManager] Pull requested (Not yet implemented)');
    await Promise.resolve();
  });
};
