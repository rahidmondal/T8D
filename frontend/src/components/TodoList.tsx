import { useEffect, useRef, useState } from 'react';

import TodoItem from '@components/TodoItem';
import { Task, TaskStatus } from '@src/models/Task';
import { deleteTask, getAllTasks, updateTask } from '@src/utils/todo/todo';

interface TodoListProps {
  onTaskChange?: () => void;
}

const EXPANDED_STATE_KEY = 't8d_expanded_tasks';
const COMPLETED_SECTION_EXPANDED_KEY = 't8d_completed_expanded';

export default function TodoList({ onTaskChange = () => {} }: TodoListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragOverRoot, setIsDragOverRoot] = useState(false);
  const [dragTargetItem, setDragTargetItem] = useState<string | null>(null);

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
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const formRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const listContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadTasks();
  }, []);

  useEffect(() => {
    localStorage.setItem(EXPANDED_STATE_KEY, JSON.stringify(expandedState));
  }, [expandedState]);

  useEffect(() => {
    localStorage.setItem(COMPLETED_SECTION_EXPANDED_KEY, JSON.stringify(showCompleted));
  }, [showCompleted]);

  useEffect(() => {
    if (activeFormId && formRefs.current[activeFormId]) {
      formRefs.current[activeFormId].focus();
    }
  }, [tasks, activeFormId]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const allTasks = await getAllTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleLocalTaskChange = (formIdToFocus: string | null = 'root') => {
    setActiveFormId(formIdToFocus);
    void loadTasks();
    onTaskChange();
  };

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
          await updateTask(draggedId, { parentId: null, createdAt: Date.now() });
        }
      } else {
        const targetTask = tasks.find(t => t.id === targetId);
        if (!targetTask || draggedId === targetId) {
          return;
        }

        let newParentId = targetTask.parentId;
        let newCreatedAt = targetTask.createdAt;

        if (position === 'inside') {
          newParentId = targetId;
          const childrenOfTarget = tasks.filter(t => t.parentId === targetId);
          newCreatedAt =
            childrenOfTarget.length > 0 ? Math.max(...childrenOfTarget.map(c => c.createdAt)) + 1000 : Date.now();
        } else {
          newParentId = targetTask.parentId;
          const siblings = tasks.filter(t => t.parentId === newParentId).sort((a, b) => a.createdAt - b.createdAt);
          const targetIndex = siblings.findIndex(t => t.id === targetId);

          if (position === 'before') {
            newCreatedAt =
              targetIndex > 0
                ? siblings[targetIndex - 1].createdAt +
                  Math.floor((targetTask.createdAt - siblings[targetIndex - 1].createdAt) / 2)
                : targetTask.createdAt - 1000;
          } else {
            newCreatedAt =
              targetIndex < siblings.length - 1
                ? targetTask.createdAt + Math.floor((siblings[targetIndex + 1].createdAt - targetTask.createdAt) / 2)
                : targetTask.createdAt + 1000;
          }
        }

        let currentParentId = newParentId;
        while (currentParentId) {
          if (currentParentId === draggedId) {
            console.error('Cannot make a task a child of itself or its descendants.');
            return;
          }
          const parentTask = tasks.find(t => t.id === currentParentId);
          currentParentId = parentTask ? parentTask.parentId : null;
        }

        await updateTask(draggedId, { parentId: newParentId, createdAt: newCreatedAt });
      }
      handleLocalTaskChange();
    } catch (error) {
      console.error('Error moving task:', error);
    }
    setIsDragOverRoot(false);
    setDragTargetItem(null);
  };
  const handleDeleteCompleted = async () => {
    const rootTasksToDelete = getCompletedRootTasks();
    if (rootTasksToDelete.length === 0) return;

    try {
      await Promise.all(rootTasksToDelete.map(task => deleteTask(task.id)));
      handleLocalTaskChange();
    } catch (error) {
      console.error('Failed to delete completed tasks:', error);
    }
  };

  const getActiveRootTasks = () =>
    tasks
      .filter(task => !task.parentId && task.status !== TaskStatus.COMPLETED)
      .sort((a, b) => a.createdAt - b.createdAt);

  const getCompletedRootTasks = () =>
    tasks
      .filter(task => !task.parentId && task.status === TaskStatus.COMPLETED)
      .sort((a, b) => a.createdAt - b.createdAt);

  const getChildTasks = (parentId: string) =>
    tasks.filter(task => task.parentId === parentId).sort((a, b) => a.createdAt - b.createdAt);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-600 dark:border-sky-500"></div>
      </div>
    );
  }

  const activeRootTasks = getActiveRootTasks();
  const completedRootTasks = getCompletedRootTasks();

  return (
    <div
      ref={listContainerRef}
      className={`min-h-[300px] p-1 rounded-md ${isDragOverRoot && !dragTargetItem ? 'border-2 border-dashed border-sky-400 dark:border-sky-600 bg-sky-50 dark:bg-sky-900/50' : ''}`}
      onDragOver={e => {
        e.preventDefault();
        if (!dragTargetItem && e.target === listContainerRef.current) {
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
        if (e.target === listContainerRef.current && draggedId) {
          void handleDropOnList(draggedId, null);
        }
        setIsDragOverRoot(false);
      }}
    >
      {activeRootTasks.length === 0 && completedRootTasks.length === 0 ? (
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
            {activeRootTasks.map(task => (
              <TodoItem
                key={task.id}
                task={task}
                childTasks={getChildTasks(task.id)}
                getChildTasks={getChildTasks}
                onDrop={(...args) => {
                  void handleDropOnList(...args);
                }}
                onTasksChange={handleLocalTaskChange}
                onDragOver={taskId => {
                  setDragTargetItem(taskId);
                }}
                loadTasks={loadTasks}
                dragTarget={dragTargetItem}
                tabIndex={0}
                expandedState={expandedState}
                setExpandedState={setExpandedState}
                activeFormId={activeFormId}
                setActiveFormId={setActiveFormId}
                registerRef={(el, id) => (formRefs.current[id] = el)}
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
                    className={`h-5 w-5 mr-2 transform transition-transform duration-200 text-slate-500 ${showCompleted ? 'rotate-180' : 'rotate-0'}`}
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
                  {completedRootTasks.map(task => (
                    <TodoItem
                      key={task.id}
                      task={task}
                      childTasks={getChildTasks(task.id)}
                      getChildTasks={getChildTasks}
                      onDrop={(...args) => {
                        void handleDropOnList(...args);
                      }}
                      onTasksChange={handleLocalTaskChange}
                      onDragOver={taskId => {
                        setDragTargetItem(taskId);
                      }}
                      dragTarget={dragTargetItem}
                      tabIndex={0}
                      loadTasks={loadTasks}
                      expandedState={expandedState}
                      setExpandedState={setExpandedState}
                      activeFormId={activeFormId}
                      setActiveFormId={setActiveFormId}
                      registerRef={(el, id) => (formRefs.current[id] = el)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
