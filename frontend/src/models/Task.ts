export enum TaskStatus {
  NOT_COMPLETED = 'not-completed',
  COMPLETED = 'completed',
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  createdAt: number;
  lastModified: number;
  dueDate: number | null;
  listId: string;

  parentId: string | null;

  hash: string;
  order: number;

  metadata?: Record<string, string | number | boolean | string[] | null>;
}
