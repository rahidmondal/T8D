import { Task, TaskStatus } from '@src/models/Task';
import { TaskList } from '@src/models/TaskList';
import { v4 as uuidv4 } from 'uuid';

import {
  addTaskListToDb,
  addTaskToDb,
  deleteAllTaskListsFromDb,
  deleteAllTasksFromDb,
  deleteTaskFromDb,
  deleteTaskListFromDb,
  getAllTaskListsFromDb,
  getAllTasksFromDb,
  getTaskFromDb,
  getTaskListFromDb,
  getTasksByListIdFromDb,
  getTasksByParentFromDb,
  updateTaskInDb,
  updateTaskListInDb,
} from '../database/database';
import * as SyncManager from '../sync/syncManager';

const generateHash = async (dataArray: (string | number | null | undefined)[]): Promise<string> => {
  const content = dataArray.map(item => item?.toString() ?? '').join('|');
  const encoder = new TextEncoder();
  const data = encoder.encode(content);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

  return hashHex;
};

export const generateTaskHash = async (task: Omit<Task, 'hash'>): Promise<string> => {
  const dataToHash = [
    task.id,
    task.name,
    task.description ?? '',
    task.status,
    task.createdAt.toString(),
    task.lastModified.toString(),
    task.dueDate?.toString() ?? '',
    task.parentId ?? '',
    task.listId,
    task.is_deleted ? 'true' : 'false',
  ];

  return generateHash(dataToHash);
};

export const createTask = async (
  name: string,
  listId: string,
  description?: string,
  parentId: string | null = null,
  order?: number,
): Promise<Task> => {
  const now = Date.now();
  const taskId = uuidv4();

  const taskWithoutHash = {
    id: taskId,
    name,
    description: description ?? '',
    status: TaskStatus.NOT_COMPLETED,
    createdAt: now,
    lastModified: now,
    dueDate: null,
    parentId,
    listId,
    order: order ?? now,
  };

  const hash = await generateTaskHash(taskWithoutHash);

  const task: Task = {
    ...taskWithoutHash,
    hash,
  };

  await addTaskToDb(task);
  void SyncManager.pushTaskChange(task);
  return task;
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  const existingTask = await getTaskFromDb(taskId);

  if (!existingTask) {
    throw new Error(`Task with id ${taskId} not found`);
  }

  const now = Date.now();
  const updatedTaskData = {
    ...existingTask,
    ...updates,
    lastModified: now,
  };

  const hash = await generateTaskHash(updatedTaskData);
  const updatedTask: Task = { ...updatedTaskData, hash };

  await updateTaskInDb(updatedTask);
  void SyncManager.pushTaskChange(updatedTask);

  if (updates.status === TaskStatus.COMPLETED) {
    const childTasks = await getTasksByParentFromDb(taskId);
    const updatePromises = childTasks.map(childTask => updateTask(childTask.id, { status: TaskStatus.COMPLETED }));
    await Promise.all(updatePromises);
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const existingTask = await getTaskFromDb(taskId);

  if (!existingTask) {
    console.warn(`Task with id ${taskId} not found during deletion`);
    return;
  }

  const finalParentId = existingTask.parentId ?? null;

  const performDelete = async (currentTaskId: string): Promise<void> => {
    const taskToDelete = await getTaskFromDb(currentTaskId);
    if (!taskToDelete) return;

    const childTasks = await getTasksByParentFromDb(currentTaskId);
    const childPromise = childTasks.map(childTask => {
      if (childTask.status === TaskStatus.COMPLETED) {
        return performDelete(childTask.id);
      } else {
        return updateTask(childTask.id, { parentId: finalParentId });
      }
    });
    await Promise.all(childPromise);

    const now = Date.now();
    const tombstoneData = {
      ...taskToDelete,
      is_deleted: true,
      lastModified: now,
    };
    const hash = await generateTaskHash(tombstoneData);
    const tombstone: Task = { ...tombstoneData, hash };

    await deleteTaskFromDb(currentTaskId);

    void SyncManager.pushTaskDelete(tombstone);
  };

  await performDelete(taskId);
};

export const getAllTasks = (): Promise<Task[]> => {
  return getAllTasksFromDb();
};

export const getTasksByList = (listId: string): Promise<Task[]> => {
  return getTasksByListIdFromDb(listId);
};

export const getTask = async (id: string): Promise<Task | undefined> => {
  const task = await getTaskFromDb(id);

  if (!task) {
    throw new Error(`Task with id ${id} not found`);
  }

  return task;
};

// --- TaskList Logic ---

export const generateTaskListHash = async (list: Omit<TaskList, 'hash'>): Promise<string> => {
  const dataToHash = [
    list.id,
    list.name,
    list.description ?? '',
    list.lastModified.toString(),
    list.order.toString(),
    list.is_deleted ? 'true' : 'false',
  ];

  return generateHash(dataToHash);
};

export const createTaskList = async (name: string, description?: string): Promise<TaskList> => {
  const now = Date.now();
  const listId = uuidv4();

  const listWithoutHash = {
    id: listId,
    name,
    description: description ?? '',
    lastModified: now,
    order: now,
  };

  const hash = await generateTaskListHash(listWithoutHash);

  const list: TaskList = {
    ...listWithoutHash,
    hash,
  };

  await addTaskListToDb(list);
  void SyncManager.pushListChange(list);
  return list;
};

export const deleteTaskList = async (listId: string): Promise<void> => {
  const existingList = await getTaskListFromDb(listId);
  if (!existingList) return;

  const tasks = await getTasksByList(listId);
  await Promise.all(tasks.map(task => deleteTask(task.id)));
  const now = Date.now();
  const tombstoneData = {
    ...existingList,
    is_deleted: true,
    lastModified: now,
  };
  const hash = await generateTaskListHash(tombstoneData);
  const tombstone: TaskList = { ...tombstoneData, hash };

  await deleteTaskListFromDb(listId);

  void SyncManager.pushListDelete(tombstone);
};

export const updateTaskList = async (listId: string, updates: Partial<Omit<TaskList, 'id'>>): Promise<TaskList> => {
  const existingList = await getTaskListFromDb(listId);
  if (!existingList) {
    throw new Error(`Task list with id ${listId} not found`);
  }

  const updatedListData: Omit<TaskList, 'hash'> = {
    ...existingList,
    ...updates,
    lastModified: Date.now(),
  };
  const hash = await generateTaskListHash(updatedListData);
  const updatedList: TaskList = { ...updatedListData, hash };

  await updateTaskListInDb(updatedList);
  void SyncManager.pushListChange(updatedList);
  return updatedList;
};

export const deleteAllTaskLists = async (): Promise<void> => {
  await deleteAllTasksFromDb();
  await deleteAllTaskListsFromDb();
};

export const getAllTaskLists = (): Promise<TaskList[]> => {
  return getAllTaskListsFromDb();
};
