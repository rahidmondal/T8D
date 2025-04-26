export interface TaskList {
  id: string;
  name: string;
  description?: string;
  taskIds: string[];
  lastModified: number;
  hash: string;
}
