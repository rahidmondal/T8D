import { useContext } from 'react';

import { TaskListContext, TaskListContextType } from '@src/context/TaskListContext';

export const useTaskLists = (): TaskListContextType => {
  const context = useContext(TaskListContext);
  if (context === undefined) {
    throw new Error('useTaskLists must be used within a TaskListProvider');
  }
  return context;
};
