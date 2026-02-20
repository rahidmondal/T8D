import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import DateTime from '@src/components/DateTime';
import TodoForm from '@src/components/TodoForm';
import TodoItem from '@src/components/TodoItem';
import { useSyncState } from '@src/hooks/useSyncState';
import { useTaskLists } from '@src/hooks/useTaskLists';
import { Task, TaskStatus } from '@src/models/Task';
import { deleteTask, getTasksByList, updateTask } from '@src/utils/todo/todo';

import RootTaskCount from './RootTaskCount';

interface TodoListProps {
  onTaskChange?: () => void;
  formRef: React.RefObject<HTMLInputElement | null>;
  listRef: React.RefObject<HTMLDivElement | null>;
}
const EXPANDED_STATE_KEY = 't8d_expanded_tasks';
const COMPLETED_SECTION_EXPANDED_KEY = 't8d_completed_expanded';

const TodoList = ({ onTaskChange = () => {}, formRef, listRef }: TodoListProps) => {
  const { taskLists, activeListId, isLoading: isListLoading } = useTaskLists();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragOverRoot, setIsDragOverRoot] = useState(false);
  const [dragTargetItem, setDragTargetItem] = useState<string | null>(null);
  const { lastSyncTimestamp } = useSyncState();

  const [focusedTaskId, setFocusedTaskId] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [showCompleted, setShowCompleted] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(COMPLETED_SECTION_EXPANDED_KEY);
      return stored ? (JSON.parse(stored) as boolean) : true;
    } catch {
      return true;
    }
  });

  const [expandedState, setExpandedState] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(EXPANDED_STATE_KEY);
      return stored ? (JSON.parse(stored) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });

  const activeList = useMemo(() => taskLists.find(list => list.id === activeListId), [taskLists, activeListId]);

  const loadTasks = useCallback(async () => {
    if (!activeListId) {
      setTasks([]);
      if (!isListLoading) setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const listTasks = await getTasksByList(activeListId);
      setTasks(listTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeListId, isListLoading]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks, lastSyncTimestamp]);

  useEffect(() => {
    localStorage.setItem(EXPANDED_STATE_KEY, JSON.stringify(expandedState));
  }, [expandedState]);

  useEffect(() => {
    localStorage.setItem(COMPLETED_SECTION_EXPANDED_KEY, JSON.stringify(showCompleted));
  }, [showCompleted]);

  useEffect(() => {
    if (focusedTaskId) {
      itemRefs.current[focusedTaskId]?.focus();
    }
  }, [focusedTaskId]);

  const getRootTotalCount = useCallback(() => {
    return tasks.filter(task => !task.parentId).length;
  }, [tasks]);

  const getRootCompletedCount = useCallback(() => {
    return tasks.filter(task => !task.parentId && task.status === TaskStatus.COMPLETED).length;
  }, [tasks]);

  const handleLocalTaskChange = useCallback(
    (_formIdToFocus?: string | null) => {
      void loadTasks();
      onTaskChange();
    },
    [loadTasks, onTaskChange],
  );

  const handleTaskAdded = useCallback(
    (newTask: Task) => {
      setTasks(prevTasks => [...prevTasks, newTask]);
      onTaskChange();
    },
    [onTaskChange],
  );

  const handleDropOnList = async (
    draggedId: string,
    targetId: string | null,
    position: 'before' | 'after' | 'inside' = 'inside',
  ) => {
    try {
      const draggedTask = tasks.find(t => t.id === draggedId);
      if (!draggedTask) {
        return;
      }

      if (targetId === null) {
        if (draggedTask.parentId !== null) {
          await updateTask(draggedId, { parentId: null, order: Date.now() });
        }
      } else {
        const targetTask = tasks.find(t => t.id === targetId);
        if (!targetTask || draggedId === targetId) {
          return;
        }

        let newParentId = targetTask.parentId;
        let newOrder = targetTask.order;

        if (position === 'inside') {
          newParentId = targetId;
          const childrenOfTarget = tasks.filter(t => t.parentId === targetId);
          newOrder = childrenOfTarget.length > 0 ? Math.max(...childrenOfTarget.map(c => c.order)) + 1 : Date.now();
        } else {
          newParentId = targetTask.parentId;
          const siblings = tasks.filter(t => t.parentId === newParentId).sort((a, b) => a.order - b.order);
          const targetIndex = siblings.findIndex(t => t.id === targetId);

          if (position === 'before') {
            newOrder =
              targetIndex > 0 ? (siblings[targetIndex - 1].order + targetTask.order) / 2 : targetTask.order - 1;
          } else {
            newOrder =
              targetIndex < siblings.length - 1
                ? (targetTask.order + siblings[targetIndex + 1].order) / 2
                : targetTask.order + 1;
          }
        }

        let currentParentId: string | null = newParentId;
        while (currentParentId) {
          if (currentParentId === draggedId) {
            console.error('Cannot make a task a child of itself or its descendants.');
            return;
          }
          const parentTask = tasks.find(t => t.id === currentParentId);
          currentParentId = parentTask ? parentTask.parentId : null;
        }

        await updateTask(draggedId, { parentId: newParentId, order: newOrder });
      }
      handleLocalTaskChange();
    } catch (error) {
      console.error('Error moving task:', error);
    }
    setIsDragOverRoot(false);
    setDragTargetItem(null);
  };

  const getChildTasks = useCallback(
    (parentId: string | null): Task[] =>
      tasks.filter(task => task.parentId === parentId).sort((a, b) => a.order - b.order),
    [tasks],
  );

  const getActiveRootTasks = useCallback(() => {
    return tasks
      .filter(task => {
        if (task.parentId) return false;

        if (task.status !== TaskStatus.COMPLETED) return true;

        const hasIncompleteDescendants = (taskId: string): boolean => {
          const children = tasks.filter(t => t.parentId === taskId);
          return children.some(child => child.status !== TaskStatus.COMPLETED || hasIncompleteDescendants(child.id));
        };

        return hasIncompleteDescendants(task.id);
      })
      .sort((a, b) => a.order - b.order);
  }, [tasks]);

  const getCompletedRootTasks = useCallback(
    () =>
      tasks
        .filter(task => {
          if (task.parentId) return false;

          if (task.status !== TaskStatus.COMPLETED) return false;

          const hasIncompleteDescendants = (taskId: string): boolean => {
            const children = tasks.filter(t => t.parentId === taskId);
            return children.some(child => child.status !== TaskStatus.COMPLETED || hasIncompleteDescendants(child.id));
          };

          return !hasIncompleteDescendants(task.id);
        })
        .sort((a, b) => a.order - b.order),
    [tasks],
  );

  const handleDeleteCompleted = async () => {
    const rootTasksToDelete = getCompletedRootTasks();
    if (rootTasksToDelete.length === 0) {
      return;
    }

    try {
      await Promise.all(rootTasksToDelete.map(task => deleteTask(task.id)));
      handleLocalTaskChange();
    } catch (error) {
      console.error('Failed to delete completed tasks:', error);
    }
  };

  const visibleTaskIds = useMemo(() => {
    const visibleIds: string[] = [];
    const addChildren = (parentId: string) => {
      const children = getChildTasks(parentId);
      for (const child of children) {
        visibleIds.push(child.id);
        if (expandedState[child.id]) {
          addChildren(child.id);
        }
      }
    };

    const activeRoots = getActiveRootTasks();
    for (const task of activeRoots) {
      visibleIds.push(task.id);
      if (expandedState[task.id]) {
        addChildren(task.id);
      }
    }

    if (showCompleted) {
      const completedRoots = getCompletedRootTasks();
      for (const task of completedRoots) {
        visibleIds.push(task.id);
        if (expandedState[task.id]) {
          addChildren(task.id);
        }
      }
    }

    return visibleIds;
  }, [getActiveRootTasks, getCompletedRootTasks, getChildTasks, expandedState, showCompleted]);

  const handleIndentTask = useCallback(
    async (taskId: string) => {
      if (visibleTaskIds.length === 0) {
        return;
      }
      const taskIndex = visibleTaskIds.indexOf(taskId);
      if (taskIndex < 1) {
        return;
      }

      const newParentId = visibleTaskIds[taskIndex - 1];
      const taskToIndent = tasks.find(t => t.id === taskId);
      const newParent = tasks.find(t => t.id === newParentId);

      if (!taskToIndent || !newParent || taskToIndent.parentId === newParentId) {
        return;
      }

      let currentParentId: string | null = newParent.id;
      while (currentParentId) {
        if (currentParentId === taskId) {
          console.error('Cannot make a task a child of its own descendant.');
          return;
        }
        const parentTask = tasks.find(t => t.id === currentParentId);
        currentParentId = parentTask ? parentTask.parentId : null;
      }

      await updateTask(taskId, { parentId: newParentId });
      handleLocalTaskChange(taskId);
    },
    [tasks, visibleTaskIds, handleLocalTaskChange],
  );

  const handleFocusFromForm = useCallback(() => {
    if (visibleTaskIds.length > 0) {
      const lastTaskId = visibleTaskIds[visibleTaskIds.length - 1];
      setFocusedTaskId(lastTaskId);
    } else {
      if (listRef.current) {
        listRef.current.focus();
      }
    }
  }, [visibleTaskIds, listRef]);

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
      return;
    }

    const currentIndex = focusedTaskId ? visibleTaskIds.indexOf(focusedTaskId) : -1;
    let nextIndex = -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = Math.min(currentIndex + 1, visibleTaskIds.length - 1);
      if (currentIndex === -1 && visibleTaskIds.length > 0) {
        nextIndex = 0;
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentIndex > 0) {
        nextIndex = currentIndex - 1;
      } else if (visibleTaskIds.length > 0) {
        nextIndex = 0;
      }
    }
    if (e.shiftKey && e.key.toUpperCase() === 'C') {
      e.preventDefault();
      setShowCompleted(prev => !prev);
      return;
    }

    if (e.shiftKey && e.key.toUpperCase() === 'D') {
      e.preventDefault();
      void handleDeleteCompleted();
      return;
    }

    if (nextIndex !== -1 && nextIndex < visibleTaskIds.length) {
      setFocusedTaskId(visibleTaskIds[nextIndex]);
    }
  };

  useEffect(() => {
    if (!showCompleted) {
      const focusedTask = tasks.find(t => t.id === focusedTaskId);
      if (focusedTask && focusedTask.status === TaskStatus.COMPLETED) {
        const activeRoots = getActiveRootTasks();
        if (activeRoots.length > 0) {
          let lastVisibleActiveTask: string | null = null;
          for (let i = visibleTaskIds.length - 1; i >= 0; i--) {
            const id: string = visibleTaskIds[i];
            if (tasks.some(task => task.id === id && task.status !== TaskStatus.COMPLETED)) {
              lastVisibleActiveTask = id;
              break;
            }
          }
          setFocusedTaskId(lastVisibleActiveTask || null);
        } else {
          setFocusedTaskId(null);
        }
      }
    }
  }, [showCompleted, focusedTaskId, tasks, visibleTaskIds, getActiveRootTasks]);
  if (isListLoading) {
    return <div className="text-center p-8 text-slate-500">Loading Lists...</div>;
  }

  if (!activeListId || !activeList) {
    return <div className="text-center p-8 text-slate-500">Select or create a list to get started.</div>;
  }

  const activeRootTasks = getActiveRootTasks();
  const completedRootTasks = getCompletedRootTasks();

  return (
    <div ref={listRef} onKeyDown={handleListKeyDown} tabIndex={-1} className="h-full flex flex-col focus:outline-none">
      <header className="flex-shrink-0 mb-4 pt-4 px-4 pl-16 lg:pl-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{activeList.name}</h1>
          <RootTaskCount completed={getRootCompletedCount()} total={getRootTotalCount()} />
        </div>
        <DateTime />
      </header>

      <div
        className={`flex-grow overflow-y-auto p-4 ${
          isDragOverRoot && !dragTargetItem
            ? 'border-2 border-dashed border-sky-400 dark:border-sky-600 bg-sky-50 dark:bg-sky-900/50'
            : ''
        }`}
        onDragOver={e => {
          e.preventDefault();
          if (!dragTargetItem) {
            setIsDragOverRoot(true);
          }
        }}
        onDragLeave={() => {
          setIsDragOverRoot(false);
        }}
        onDrop={e => {
          e.preventDefault();
          e.stopPropagation();
          const draggedId = e.dataTransfer.getData('taskId');
          if (draggedId) {
            void handleDropOnList(draggedId, null);
          }
          setIsDragOverRoot(false);
        }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-600 dark:border-sky-500"></div>
          </div>
        ) : activeRootTasks.length === 0 && completedRootTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-slate-400 dark:text-slate-500 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg">No tasks yet</p>
            <p className="text-slate-400 dark:text-slate-500">Add your first task to get started.</p>
          </div>
        ) : (
          <div>
            <div className="space-y-3">
              {activeRootTasks.filter(Boolean).map(task => (
                <TodoItem
                  key={task.id}
                  task={task}
                  childTasks={getChildTasks(task.id)}
                  getChildTasks={getChildTasks}
                  onDrop={(...args) => {
                    void handleDropOnList(...args);
                  }}
                  onTasksChange={handleLocalTaskChange}
                  onDragOver={setDragTargetItem}
                  loadTasks={loadTasks}
                  dragTarget={dragTargetItem}
                  expandedState={expandedState}
                  setExpandedState={setExpandedState}
                  focusedTaskId={focusedTaskId}
                  setFocusedTaskId={setFocusedTaskId}
                  registerItemRef={(el, id) => {
                    itemRefs.current[id] = el;
                  }}
                  onIndentTask={id => void handleIndentTask(id)}
                  onTaskAdded={handleTaskAdded}
                />
              ))}
            </div>

            {completedRootTasks.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={() => {
                      setShowCompleted(!showCompleted);
                    }}
                    className="flex flex-grow items-center text-left px-2 py-1 rounded hover:bg-slate-200/60 dark:hover:bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-sky-500"
                    aria-expanded={showCompleted}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 mr-2 transform transition-transform duration-200 text-slate-500 ${
                        showCompleted ? 'rotate-0' : '-rotate-90'
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Completed</span>
                    <span className="ml-2 text-sm font-normal text-slate-400 dark:text-slate-500">
                      {completedRootTasks.length}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      void handleDeleteCompleted();
                    }}
                    className="ml-2 p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-red-500"
                    aria-label="Delete all completed tasks"
                    title="Clear all completed tasks"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
                {showCompleted && (
                  <div className="space-y-3 mt-3 opacity-70">
                    {completedRootTasks.filter(Boolean).map(task => (
                      <TodoItem
                        key={task.id}
                        task={task}
                        childTasks={getChildTasks(task.id)}
                        getChildTasks={getChildTasks}
                        onDrop={(...args) => {
                          void handleDropOnList(...args);
                        }}
                        onTasksChange={handleLocalTaskChange}
                        onDragOver={setDragTargetItem}
                        dragTarget={dragTargetItem}
                        loadTasks={loadTasks}
                        expandedState={expandedState}
                        setExpandedState={setExpandedState}
                        focusedTaskId={focusedTaskId}
                        setFocusedTaskId={setFocusedTaskId}
                        registerItemRef={(el, id) => {
                          itemRefs.current[id] = el;
                        }}
                        onIndentTask={id => void handleIndentTask(id)}
                        onTaskAdded={handleTaskAdded}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex-shrink-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <TodoForm
          ref={formRef}
          taskListId={activeListId}
          parentId={null}
          onTaskCreated={handleTaskAdded}
          onFocusParent={handleFocusFromForm}
        />
      </div>
    </div>
  );
};

TodoList.displayName = 'TodoList';
export default TodoList;
