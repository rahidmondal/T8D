import { Task } from '@src/models/Task';
import { TaskList } from '@src/models/TaskList';
import { apiClient } from '@src/utils/api/apiClient';

import {
  addToOutbox,
  applyServerChanges,
  clearOutbox,
  getAllOutboxEntries,
  getAllTaskListsFromDb,
  getAllTasksFromDb,
  OutboxEntry,
} from '../database/database';
import { getSocket } from '../realtime/socket';

import { getSyncEnabled } from './syncSettings';

const LAST_SYNC_KEY = 't8d-last-sync-time';

let isSyncing = false;

interface SyncPayload {
  changes: {
    taskLists: TaskList[];
    tasks: Task[];
  };
  lastSync?: string | undefined;
  socketId?: string;
}

interface SyncResponse {
  timestamp: string;
  changes: {
    taskLists: TaskList[];
    tasks: Task[];
  };
}

const safelyExecute = async (operationName: string, operation: () => Promise<void>) => {
  try {
    await operation();
  } catch (error) {
    console.error(`SyncManager Error [${operationName}]:`, error);
  }
};

export const performSync = async (): Promise<void> => {
  if (isSyncing || !getSyncEnabled() || !navigator.onLine) return;

  isSyncing = true;
  console.info('[SyncManager] Starting sync...');

  try {
    const outboxEntries = await getAllOutboxEntries();
    const lastSync = localStorage.getItem(LAST_SYNC_KEY) || undefined;

    let maxProcessedId = 0;

    const uniqueEntries = new Map<string, OutboxEntry>();
    for (const entry of outboxEntries) {
      if (entry.id === undefined) continue;

      if (entry.id > maxProcessedId) {
        maxProcessedId = entry.id;
      }

      const existing = uniqueEntries.get(entry.targetId);
      if (!existing || entry.id > (existing.id ?? 0)) {
        uniqueEntries.set(entry.targetId, entry);
      }
    }

    const socket = getSocket();
    const socketId = socket?.connected ? socket.id : undefined;

    const payload: SyncPayload = {
      changes: { taskLists: [], tasks: [] },
      lastSync,
    };

    if (socketId) {
      payload.socketId = socketId;
    }

    for (const entry of uniqueEntries.values()) {
      if (entry.entity === 'LIST' && entry.payload) {
        payload.changes.taskLists.push(entry.payload as TaskList);
      } else if (entry.entity === 'TASK' && entry.payload) {
        payload.changes.tasks.push(entry.payload as Task);
      }
    }

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

    if (maxProcessedId > 0) {
      await clearOutbox(maxProcessedId);
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

export const pushTaskDelete = async (task: Task): Promise<void> => {
  await safelyExecute('pushTaskDelete', async () => {
    await addToOutbox({
      timestamp: Date.now(),
      entity: 'TASK',
      operation: 'DELETE',
      targetId: task.id,
      payload: task,
    });
    void performSync();
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
    void performSync();
  });
};

export const pushListDelete = async (list: TaskList): Promise<void> => {
  await safelyExecute('pushListDelete', async () => {
    await addToOutbox({
      timestamp: Date.now(),
      entity: 'LIST',
      operation: 'DELETE',
      targetId: list.id,
      payload: list,
    });
    void performSync();
  });
};

export const pullChanges = (): void => {
  void performSync();
};

export const queueAllLocalData = async (): Promise<void> => {
  await safelyExecute('queueAllLocalData', async () => {
    console.info('[SyncManager] Queueing ALL local data for initial sync...');

    const [lists, tasks] = await Promise.all([getAllTaskListsFromDb(), getAllTasksFromDb()]);

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
