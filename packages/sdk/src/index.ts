export enum TaskStatus {
  NOT_COMPLETED = 'not_completed',
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
  is_deleted?: boolean;
}

export interface TaskList {
  id: string;
  name: string;
  description?: string;
  lastModified: number;
  hash: string;
  order: number;
  is_deleted?: boolean;
}

export interface T8DAPI {
  db: any;
  ui: any;
  storage: any;
}
