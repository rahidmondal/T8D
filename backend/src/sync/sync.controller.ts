import { type User } from '@prisma/client';
import { type Request, type Response } from 'express';
import { z } from 'zod';

import { prisma } from '../db/client.js';

// --- Zod Validation Schemas ---

const TaskStatusSchema = z.enum(['not_completed', 'completed']);

const TaskListSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  lastModified: z.number(),
  is_deleted: z.boolean().optional().default(false),
  order: z.number().optional().default(0),
  hash: z.string(),
});

const TaskSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  status: TaskStatusSchema,
  createdAt: z.number(),
  lastModified: z.number(),
  dueDate: z.number().nullable().optional(),
  listId: z.uuid(),
  parentId: z.uuid().nullable().optional(),
  order: z.number().optional().default(0),
  is_deleted: z.boolean().optional().default(false),
  hash: z.string(),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
});

const PushBatchSchema = z.object({
  taskLists: z.array(TaskListSchema).optional().default([]),
  tasks: z.array(TaskSchema).optional().default([]),
});

// --- Controller Functions ---

export const pushChanges = async (req: Request, res: Response) => {
  try {
    const user = req.user as User;

    const validation = PushBatchSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        message: 'Invalid sync data format',
        errors: validation.error.issues,
      });
      return;
    }

    const { taskLists, tasks } = validation.data;
    console.info(`[Sync] Push from ${user.email}: ${String(taskLists.length)} lists, ${String(tasks.length)} tasks`);

    await prisma.$transaction(async tx => {
      // --- Upsert Lists ---
      for (const list of taskLists) {
        await tx.taskList.upsert({
          where: { id: list.id },
          create: {
            id: list.id,
            name: list.name,
            description: list.description,
            lastModified: new Date(list.lastModified),
            is_deleted: list.is_deleted,
            order: list.order,
            userId: user.id,
            hash: list.hash,
          },
          update: {
            name: list.name,
            description: list.description,
            lastModified: new Date(list.lastModified),
            is_deleted: list.is_deleted,
            order: list.order,
            hash: list.hash,
          },
        });
      }

      // --- Upsert Tasks ---
      for (const task of tasks) {
        await tx.task.upsert({
          where: { id: task.id },
          create: {
            id: task.id,
            name: task.name,
            description: task.description,
            status: task.status === 'completed' ? 'completed' : 'not_completed',
            createdAt: new Date(task.createdAt),
            lastModified: new Date(task.lastModified),
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            listId: task.listId,
            parentId: task.parentId,
            order: task.order,
            is_deleted: task.is_deleted,
            hash: task.hash,
            metadata: task.metadata ?? undefined,
          },
          update: {
            name: task.name,
            description: task.description,
            status: task.status === 'completed' ? 'completed' : 'not_completed',
            lastModified: new Date(task.lastModified),
            dueDate: task.dueDate ? new Date(task.dueDate) : null,
            listId: task.listId,
            parentId: task.parentId,
            order: task.order,
            is_deleted: task.is_deleted,
            hash: task.hash,
            metadata: task.metadata ?? undefined,
          },
        });
      }
    });

    res.status(200).json({ message: 'Push successful' });
  } catch (error) {
    console.error('[Sync] Push failed:', error);
    res.status(500).json({ message: 'Internal server error during sync' });
  }
};

export const pullChanges = async (_req: Request, res: Response) => {
  await Promise.resolve();
  res.status(501).json({ message: 'Pull not implemented yet' });
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
      `[Sync] Bootstrap for ${user.email}: sending ${String(lists.length)} lists, ${String(tasks.length)} tasks`,
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
