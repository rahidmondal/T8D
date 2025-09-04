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

export const generateTaskHash = async (task: Omit<Task, 'hash'>): Promise<string> => {
  const content = `${task.id}${task.name}${task.description ?? ''}${task.status}${task.createdAt.toString()}${task.lastModified.toString()}${task.dueDate?.toString() ?? ''}${task.parentId ?? ''}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(content);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

  return hashHex;
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

  const hash = await generateTaskHash({ ...taskWithoutHash, description: taskWithoutHash.description ?? '' });

  const task: Task = {
    ...taskWithoutHash,
    description: taskWithoutHash.description ?? '',
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
  const updatedTask = {
    ...existingTask,
    ...updates,
    lastModified: now,
  };

  updatedTask.hash = await generateTaskHash(updatedTask);
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
  await Promise.all(
    childTasks.map(async childTask => {
      if (childTask.status === TaskStatus.COMPLETED) {
        await deleteTaskFromDb(childTask.id);
      } else {
        await updateTask(childTask.id, { parentId: existingTask.parentId ?? null });
      }
    }),
  );

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

export const loadTasks = (): Task[] => {
  const tasks = JSON.parse(localStorage.getItem('tasks') || '[]') as Task[];
  return tasks;
};

export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};
