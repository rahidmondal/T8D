import { ReactNode, useCallback, useEffect, useState } from 'react';

import { TaskListContext } from '@src/context/TaskListContext';
import { TaskList } from '@src/models/TaskList';
import { createTaskList, deleteTaskList, getAllTaskLists, updateTaskList } from '@src/utils/todo/todo';

const LAST_ACTIVE_LIST_KEY = 't8d-last-active-list';

export const TaskListProvider = ({ children }: { children: ReactNode }) => {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [activeListId, setActiveListIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeLists = useCallback(async () => {
    setIsLoading(true);
    try {
      let lists = await getAllTaskLists();
      let currentActiveId = null;

      if (lists.length === 0) {
        const defaultList = await createTaskList('Default List');
        lists = [defaultList];
        currentActiveId = defaultList.id;
      } else {
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
    } catch (error: unknown) {
      console.error('Failed to initialize task lists:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void initializeLists();
  }, [initializeLists]);

  const setActiveListId = (listId: string) => {
    setActiveListIdState(listId);
    localStorage.setItem(LAST_ACTIVE_LIST_KEY, listId);
  };

  const addTaskList = async (name: string) => {
    try {
      const newList = await createTaskList(name);
      setTaskLists(prevLists => [...prevLists, newList]);
      setActiveListId(newList.id);
      return newList;
    } catch (error) {
      console.error('Failed to add task list:', error);
      throw error;
    }
  };
  const handleUpdateTaskList = async (listId: string, updates: Partial<TaskList>) => {
    try {
      const updatedList = await updateTaskList(listId, updates);

      setTaskLists(prevLists => prevLists.map(list => (list.id === listId ? updatedList : list)));
    } catch (error) {
      console.error('Failed to update task list:', error);
    }
  };
  const removeTaskList = async (listId: string) => {
    if (taskLists.length <= 1) {
      console.error('You cannot delete the last task list.');
      return;
    }

    try {
      await deleteTaskList(listId);
      const remainingLists = taskLists.filter(list => list.id !== listId);
      setTaskLists(remainingLists);

      if (activeListId === listId) {
        setActiveListId(remainingLists[0].id);
      }
    } catch (error) {
      console.error('Failed to remove task list:', error);
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
