import { createContext } from 'react';

import type { TaskList } from '@src/models/TaskList';

export interface TaskListContextType {
  taskLists: TaskList[];
  activeListId: string | null;
  setActiveListId: (listId: string) => void;
  addTaskList: (name: string) => Promise<TaskList | undefined>;
  removeTaskList: (listId: string) => Promise<void>;
  updateTaskList: (listId: string, updates: Partial<TaskList>) => Promise<void>;
  isLoading: boolean;
}

export const TaskListContext = createContext<TaskListContextType | undefined>(undefined);
