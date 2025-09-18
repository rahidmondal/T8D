import { ReactNode, useEffect, useState } from 'react';

import { TaskListContext } from '@src/hooks/useTaskLists';
import { TaskList } from '@src/models/TaskList';
import { createTaskList, deleteTaskList, getAllTaskLists, updateTaskList } from '@src/utils/todo/todo';

const LAST_ACTIVE_LIST_KEY = 't8d-last-active-list';

export const TaskListProvider = ({ children }: { children: ReactNode }) => {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [activeListId, setActiveListIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs only once to initialize the lists
  useEffect(() => {
    const initializeLists = async () => {
      setIsLoading(true);
      try {
        let lists = await getAllTaskLists();
        let currentActiveId = null;

        // If no lists exist in the DB, create a default one.
        if (lists.length === 0) {
          const defaultList = await createTaskList('My Tasks');
          lists = [defaultList];
          currentActiveId = defaultList.id;
        } else {
          // If lists exist, determine the active one.
          const lastActiveId = localStorage.getItem(LAST_ACTIVE_LIST_KEY);
          if (lastActiveId && lists.some(l => l.id === lastActiveId)) {
            currentActiveId = lastActiveId;
          } else {
            currentActiveId = lists[0].id; // Fallback to the first list
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
    // Automatically switch to the new list
    setActiveListId(newList.id);
    return newList;
  };

  const handleUpdateTaskList = async (listId: string, updates: Partial<TaskList>) => {
    const updatedList = await updateTaskList(listId, updates);
    setTaskLists(prev => prev.map(list => (list.id === listId ? updatedList : list)));
  };

  const removeTaskList = async (listId: string) => {
    if (taskLists.length <= 1) {
      alert('You cannot delete the last task list.');
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
    setActiveListId,
    addTaskList,
    updateTaskList: handleUpdateTaskList,
    removeTaskList,
    isLoading,
  };

  return <TaskListContext.Provider value={value}>{children}</TaskListContext.Provider>;
};
