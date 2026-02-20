export interface TaskList {
  id: string;
  name: string;
  description?: string;
  lastModified: number;
  hash: string;
  order: number;
  is_deleted?: boolean;
}
