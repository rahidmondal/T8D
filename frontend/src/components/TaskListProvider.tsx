import { ReactNode, useEffect, useState } from 'react';

import { TaskListContext } from '@src/context/TaskListContext';
import { TaskList } from '@src/models/TaskList';
import { createTaskList, deleteTaskList, getAllTaskLists, updateTaskList } from '@src/utils/todo/todo';

const LAST_ACTIVE_LIST_KEY = 't8d-last-active-list';

export const TaskListProvider = ({ children }: { children: ReactNode }) => {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [activeListId, setActiveListIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLists = async () => {
      setIsLoading(true);
      try {
        let lists = await getAllTaskLists();
        let currentActiveId = null;

        // If no lists exist in the DB, create a default one.
        if (lists.length === 0) {
          const defaultList = await createTaskList('Default List');
          lists = [defaultList];
          currentActiveId = defaultList.id;
        } else {
          // If lists exist, determine the active one.
          const lastActiveId = localStorage.getItem(LAST_ACTIVE_LIST_KEY);
          if (lastActiveId && lists.some(list => list.id === lastActiveId)) {
            currentActiveId = lastActiveId;
          } else {
            currentActiveId = lists[0].id;
          }
        }

        setTaskLists(lists);
        if (currentActiveId) {
          setActiveListIdState(currentActiveId);
          localStorage.setItem(LAST_ACTIVE_LIST_KEY, currentActiveId);
        }
      } catch (error) {
        console.error('Failed to initialize task lists:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeLists();
  }, []);

  const setActiveListId = (listId: string) => {
    setActiveListIdState(listId);
    localStorage.setItem(LAST_ACTIVE_LIST_KEY, listId);
  };

  const addTaskList = async (name: string) => {
    const newList = await createTaskList(name);
    setTaskLists(prev => [...prev, newList]);
    setActiveListId(newList.id);
    return newList;
  };

  const handleUpdateTaskList = async (listId: string, updates: Partial<TaskList>) => {
    const updatedList = await updateTaskList(listId, updates);
    setTaskLists(prev => prev.map(list => (list.id === listId ? updatedList : list)));
  };

  const removeTaskList = async (listId: string) => {
    if (taskLists.length <= 1) {
      console.error('You cannot delete the last task list.');
      return;
    }
    await deleteTaskList(listId);
    const remainingLists = taskLists.filter(list => list.id !== listId);
    setTaskLists(remainingLists);

    // If the deleted list was the active one, switch to another list
    if (activeListId === listId) {
      const newActiveId = remainingLists[0]?.id ?? null;
      if (newActiveId) {
        setActiveListId(newActiveId);
      }
    }
  };

  const value = {
    taskLists,
    activeListId,
    isLoading,
    setActiveListId,
    addTaskList,
    updateTaskList: handleUpdateTaskList,
    removeTaskList,
  };

  return <TaskListContext.Provider value={value}>{children}</TaskListContext.Provider>;
};
