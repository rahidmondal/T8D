import { type Task, type TaskList, type User } from '@prisma/client';
import { type Request, type Response } from 'express';
import { z } from 'zod';

import { prisma } from '../db/client.js';

const TaskStatusSchema = z.enum(['not_completed', 'completed']);

const TaskListSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  lastModified: z.coerce.date(),
  is_deleted: z.boolean().optional().default(false),
  order: z.number().optional().default(0),
  hash: z.string(),
});

const TaskSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  status: TaskStatusSchema,
  createdAt: z.coerce.date(),
  lastModified: z.coerce.date(),
  dueDate: z.coerce.date().nullable().optional(),
  listId: z.uuid(),
  parentId: z.uuid().nullable().optional(),
  order: z.number().optional().default(0),
  is_deleted: z.boolean().optional().default(false),
  hash: z.string(),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
});

const SyncRequestSchema = z.object({
  changes: z.object({
    taskLists: z.array(TaskListSchema).optional().default([]),
    tasks: z.array(TaskSchema).optional().default([]),
  }),
  lastSync: z.string().optional(),
});

export const syncMain = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;

    const validation = SyncRequestSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ message: 'Invalid sync data', errors: validation.error.issues });
      return;
    }

    const { changes, lastSync } = validation.data;
    const lastSyncDate = lastSync ? new Date(lastSync) : new Date(0);

    const now = new Date();

    console.info(
      `[Sync] Request from ${user.id}. Pushing ${String(changes.tasks.length)} tasks. Pulling since ${lastSyncDate.toISOString()}`,
    );

    const result = await prisma.$transaction(async tx => {
      let pushedListsCount = 0;
      if (changes.taskLists.length > 0) {
        const existingLists = await tx.taskList.findMany({
          where: {
            id: { in: changes.taskLists.map(l => l.id) },
            userId: user.id,
          },
        });
        const existingListMap = new Map<string, TaskList>(existingLists.map(l => [l.id, l]));

        for (const list of changes.taskLists) {
          const existing = existingListMap.get(list.id);

          const shouldUpdate =
            !existing ||
            list.lastModified.getTime() > existing.lastModified.getTime() ||
            (list.lastModified.getTime() === existing.lastModified.getTime() && list.hash > existing.hash);

          if (shouldUpdate) {
            await tx.taskList.upsert({
              where: { id: list.id },
              create: {
                id: list.id,
                userId: user.id,
                name: list.name,
                description: list.description,
                lastModified: list.lastModified,
                is_deleted: list.is_deleted,
                order: list.order,
                hash: list.hash,
              },
              update: {
                name: list.name,
                description: list.description,
                lastModified: list.lastModified,
                is_deleted: list.is_deleted,
                order: list.order,
                hash: list.hash,
              },
            });
            pushedListsCount++;
          }
        }
      }

      let pushedTasksCount = 0;
      if (changes.tasks.length > 0) {
        const existingTasks = await tx.task.findMany({
          where: {
            id: { in: changes.tasks.map(t => t.id) },
            list: { userId: user.id },
          },
        });
        const existingTaskMap = new Map<string, Task>(existingTasks.map(t => [t.id, t]));

        for (const task of changes.tasks) {
          const existing = existingTaskMap.get(task.id);

          const shouldUpdate =
            !existing ||
            task.lastModified.getTime() > existing.lastModified.getTime() ||
            (task.lastModified.getTime() === existing.lastModified.getTime() && task.hash > existing.hash);

          if (shouldUpdate) {
            await tx.task.upsert({
              where: { id: task.id },
              create: {
                id: task.id,
                listId: task.listId,
                name: task.name,
                description: task.description,
                status: task.status,
                createdAt: task.createdAt,
                lastModified: task.lastModified,
                dueDate: task.dueDate,
                parentId: task.parentId,
                order: task.order,
                is_deleted: task.is_deleted,
                hash: task.hash,
                metadata: task.metadata ?? undefined,
              },
              update: {
                name: task.name,
                description: task.description,
                status: task.status,
                lastModified: task.lastModified,
                dueDate: task.dueDate,
                listId: task.listId,
                parentId: task.parentId,
                order: task.order,
                is_deleted: task.is_deleted,
                hash: task.hash,
                metadata: task.metadata ?? undefined,
              },
            });
            pushedTasksCount++;
          }
        }
      }

      const [pulledLists, pulledTasks] = await Promise.all([
        tx.taskList.findMany({
          where: {
            userId: user.id,
            lastModified: { gt: lastSyncDate },
          },
        }),
        tx.task.findMany({
          where: {
            list: { userId: user.id },
            lastModified: { gt: lastSyncDate },
          },
        }),
      ]);

      return {
        pushed: { lists: pushedListsCount, tasks: pushedTasksCount },
        pulled: { taskLists: pulledLists, tasks: pulledTasks },
      };
    });

    console.info(
      `[Sync] Success for ${user.id}. Pushed: ${String(result.pushed.tasks)} tasks. Pulled: ${String(result.pulled.tasks.length)} tasks.`,
    );

    res.status(200).json({
      timestamp: now.toISOString(),
      changes: result.pulled,
    });
  } catch (error) {
    console.error('[Sync] Error:', error);
    res.status(500).json({ message: 'Internal server error during sync' });
  }
};

export const bootstrap = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;
    const now = new Date();

    const [lists, tasks] = await Promise.all([
      prisma.taskList.findMany({ where: { userId: user.id } }),
      prisma.task.findMany({ where: { list: { userId: user.id } } }),
    ]);

    console.info(
      `[Sync] Bootstrap for ${user.id}: sending ${String(lists.length)} lists, ${String(tasks.length)} tasks`,
    );

    res.status(200).json({
      timestamp: now.toISOString(),
      lists,
      tasks,
    });
  } catch (error) {
    console.error('[Sync] Bootstrap failed:', error);
    res.status(500).json({ message: 'Internal server error during bootstrap' });
  }
};
