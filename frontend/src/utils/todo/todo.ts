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

export const generateTaskHash = async (task: Omit<Task, 'hash'>): Promise<string> => {
  const content = `${task.id}${task.name}${task.description ?? ''}${task.status}${task.createdAt.toString()}${task.lastModified.toString()}${task.dueDate?.toString() ?? ''}${task.parentId ?? ''}${task.listId}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(content);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

  return hashHex;
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

  if (updates.status === TaskStatus.COMPLETED) {
    const childTasks = await getTasksByParentFromDb(taskId);
    const updatePromises = childTasks.map(childTask => updateTask(childTask.id, { status: TaskStatus.COMPLETED }));
    await Promise.all(updatePromises);
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const existingTask = await getTaskFromDb(taskId);

  if (!existingTask) {
    throw new Error(`Task with id ${taskId} not found`);
  }

  const childTasks = await getTasksByParentFromDb(taskId);
  const childTasksDeletePromises = childTasks.map(childTask => {
    if (childTask.status === TaskStatus.COMPLETED) {
      return deleteTask(childTask.id);
    }
    return updateTask(childTask.id, { parentId: existingTask.parentId ?? null });
  });

  await Promise.all(childTasksDeletePromises);

  await deleteTaskFromDb(taskId);
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
  const content = `${list.id}${list.name}${list.description ?? ''}${list.lastModified.toString()}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
};

export const createTaskList = async (name: string, description?: string): Promise<TaskList> => {
  const now = Date.now();
  const listId = uuidv4();

  const listWithoutHash = {
    id: listId,
    name,
    description: description ?? '',
    lastModified: now,
  };

  const hash = await generateTaskListHash(listWithoutHash);

  const list: TaskList = {
    ...listWithoutHash,
    hash,
  };

  await addTaskListToDb(list);
  return list;
};

export const deleteTaskList = async (listId: string): Promise<void> => {
  const tasks = await getTasksByList(listId);
  const deletePromises = tasks.map(task => deleteTaskFromDb(task.id));
  await Promise.all(deletePromises);
  await deleteTaskListFromDb(listId);
};

export const updateTaskList = async (listId: string, updates: Partial<Omit<TaskList, 'id'>>): Promise<TaskList> => {
  const existingList = await getTaskListFromDb(listId);
  if (!existingList) {
    throw new Error(`Task list with id ${listId} not found`);
  }

  const updatedList: TaskList = {
    ...existingList,
    ...updates,
    lastModified: Date.now(),
  };

  await updateTaskListInDb(updatedList);
  return updatedList;
};

export const deleteAllTaskLists = async (): Promise<void> => {
  await deleteAllTasksFromDb();
  await deleteAllTaskListsFromDb();
};

export const getAllTaskLists = (): Promise<TaskList[]> => {
  return getAllTaskListsFromDb();
};
