export enum TaskStatus {
  NOT_COMPLETED = 'not-completed',
  COMPLETED = 'completed',
  WORKING = 'working',
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  createdAt: number;
  lastModified: number;
  dueDate: number | null;

  parentId: string | null;

  hash: string;

  metadata?: Record<string, string | number | boolean | string[] | null>;
}
