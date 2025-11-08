import { Task } from '@src/models/Task';
import { TaskList } from '@src/models/TaskList';
import { apiClient } from '@src/utils/api/apiClient';

import { addToOutbox, applyServerChanges, clearOutbox, getAllOutboxEntries, OutboxEntry } from '../database/database';
import { getAllTaskLists, getAllTasks } from '../todo/todo';

import { getSyncEnabled } from './syncSettings';

const LAST_SYNC_KEY = 't8d-last-sync-time';

let isSyncing = false;

interface SyncPayload {
  changes: {
    taskLists: TaskList[];
    tasks: Task[];
  };
  lastSync?: string | undefined;
}

interface SyncResponse {
  timestamp: string;
  changes: {
    taskLists: TaskList[];
    tasks: Task[];
  };
}

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

export const performSync = async (): Promise<void> => {
  if (isSyncing || !getSyncEnabled()) return;

  isSyncing = true;
  console.info('[SyncManager] Starting sync...');

  try {
    const outboxEntries = await getAllOutboxEntries();
    const lastSync = localStorage.getItem(LAST_SYNC_KEY) || undefined;

    const uniqueEntries = new Map<string, OutboxEntry>();
    for (const entry of outboxEntries) {
      uniqueEntries.set(entry.targetId, entry);
    }

    const payload: SyncPayload = {
      changes: { taskLists: [], tasks: [] },
      lastSync,
    };

    for (const entry of uniqueEntries.values()) {
      if (entry.entity === 'LIST' && entry.payload) {
        payload.changes.taskLists.push(entry.payload as TaskList);
      } else if (entry.entity === 'TASK' && entry.payload) {
        payload.changes.tasks.push(entry.payload as Task);
      }
    }

    const lastProcessedId = outboxEntries.length > 0 ? outboxEntries[outboxEntries.length - 1].id : undefined;

    const response = await apiClient<SyncResponse>('/api/v1/sync/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response) throw new Error('Empty response from sync server');

    if (response.changes.tasks.length > 0 || response.changes.taskLists.length > 0) {
      console.info(
        `[SyncManager] Applying ${String(response.changes.tasks.length)} tasks and ${String(response.changes.taskLists.length)} lists from server.`,
      );
      await applyServerChanges(response.changes);
    }

    if (lastProcessedId !== undefined) {
      await clearOutbox(lastProcessedId);
    }

    localStorage.setItem(LAST_SYNC_KEY, response.timestamp);

    console.info('[SyncManager] Sync complete.');
  } catch (error) {
    console.error('[SyncManager] Sync failed:', error);
  } finally {
    isSyncing = false;
  }
};

// --- Push Operations ---

export const pushTaskChange = async (task: Task): Promise<void> => {
  await safelyExecute('pushTaskChange', async () => {
    await addToOutbox({
      timestamp: Date.now(),
      entity: 'TASK',
      operation: 'UPDATE',
      targetId: task.id,
      payload: task,
    });
    void performSync();
  });
};

export const pushTaskDelete = (taskId: string): void => {
  console.warn('[SyncManager] pushTaskDelete not yet fully implemented with Tombstones. Task ID:', taskId);
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
    void performSync();
  });
};

export const pushListDelete = (listId: string): void => {
  console.warn('[SyncManager] pushListDelete not yet implemented with Tombstones. List ID:', listId);
};

export const pullChanges = (): void => {
  void performSync();
};
export const queueAllLocalData = async (): Promise<void> => {
  await safelyExecute('queueAllLocalData', async () => {
    console.info('[SyncManager] Queueing ALL local data for initial sync...');

    const [lists, tasks] = await Promise.all([getAllTaskLists(), getAllTasks()]);

    for (const list of lists) {
      await addToOutbox({
        timestamp: Date.now(),
        entity: 'LIST',
        operation: 'UPDATE',
        targetId: list.id,
        payload: list,
      });
    }

    for (const task of tasks) {
      await addToOutbox({
        timestamp: Date.now(),
        entity: 'TASK',
        operation: 'UPDATE',
        targetId: task.id,
        payload: task,
      });
    }

    console.info(`[SyncManager] Queued ${String(lists.length)} lists and ${String(tasks.length)} tasks.`);
    void performSync();
  });
};
