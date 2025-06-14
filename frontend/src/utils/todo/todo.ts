import { Task, TaskStatus } from '@src/models/Task';
import { v4 as uuidv4 } from 'uuid';

import {
  addTaskToDb,
  deleteTaskFromDb,
  getAllTasksFromDb,
  getTaskFromDb,
  getTasksByParentFromDb,
  updateTaskInDb,
} from '../database/database';

const generateTaskHash = (task: Omit<Task, 'hash'>): string => {
  const content = `${task.id}${task.name}${task.description ?? ''}${task.status}${task.createdAt.toString()}${task.lastModified.toString()}${task.dueDate?.toString() ?? ''}${task.parentId ?? ''}`;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

export const createTask = async (name: string, description?: string, parentId: string | null = null): Promise<Task> => {
  const now = Date.now();
  const taskId = uuidv4();

  const taskWithoutHash = {
    id: taskId,
    name,
    description,
    status: TaskStatus.NOT_COMPLETED,
    createdAt: now,
    lastModified: now,
    dueDate: null,
    parentId,
  };

  const task: Task = {
    ...taskWithoutHash,
    hash: generateTaskHash({ ...taskWithoutHash, description: taskWithoutHash.description ?? '' }),
  } as Task;

  await addTaskToDb(task);
  return task;
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  const existingTask = await getTaskFromDb(taskId);

  if (!existingTask) {
    throw new Error(`Task with id ${taskId} not found`);
  }

  const now = Date.now();
  const updatedTask = {
    ...existingTask,
    ...updates,
    lastModified: now,
  };

  updatedTask.hash = generateTaskHash(updatedTask);
  await updateTaskInDb(updatedTask);

  if (updates.status === TaskStatus.COMPLETED) {
    const childTasks = await getTasksByParentFromDb(taskId);
    for (const childTask of childTasks) {
      await updateTask(childTask.id, { status: TaskStatus.COMPLETED });
    }
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const existingTask = await getTaskFromDb(taskId);

  if (!existingTask) {
    throw new Error(`Task with id ${taskId} not found`);
  }

  const childTasks = await getTasksByParentFromDb(taskId);
  for (const childTask of childTasks) {
    await updateTask(childTask.id, { parentId: null });
  }

  await deleteTaskFromDb(taskId);
};

export const getAllTasks = async (): Promise<Task[]> => {
  return await getAllTasksFromDb();
};

export const getTask = async (id: string): Promise<Task | undefined> => {
  const task = await getTaskFromDb(id);

  if (!task) {
    throw new Error(`Task with id ${id} not found`);
  }

  return task;
};
