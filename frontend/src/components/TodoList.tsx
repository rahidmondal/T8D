import { useEffect, useRef, useState } from 'react';

import TodoForm from '@components/TodoForm';
import TodoItem from '@components/TodoItem';

import { Task } from '../models/Task';
import { createTask, getAllTasks, updateTask } from '../utils/todo/todo';

interface TodoListProps {
  onTaskChange?: () => void; // To notify App.tsx or other parent components of changes
}

export default function TodoList({ onTaskChange = () => {} }: TodoListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragOverRoot, setIsDragOverRoot] = useState(false); // For dropping at root level
  const [quickTaskInput, setQuickTaskInput] = useState('');
  const [showFullForm, setShowFullForm] = useState(false); // For the sticky form to expand
  const [dragTargetItem, setDragTargetItem] = useState<string | null>(null); // ID of item being hovered over

  const listContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const allTasks = await getAllTasks();
      // Ensure tasks are sorted for consistent display, especially after reordering
      setTasks(allTasks.sort((a, b) => (a.parentId === b.parentId ? a.createdAt - b.createdAt : 0)));
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalTaskChange = () => {
    loadTasks();
    onTaskChange(); // Notify parent
  };

  const handleDropOnList = async (
    draggedId: string,
    targetId: string | null, // null if dropping at root or on an item
    position: 'before' | 'after' | 'inside' = 'inside',
  ) => {
    try {
      const draggedTask = tasks.find(t => t.id === draggedId);
      if (!draggedTask) return;

      if (targetId === null) {
        // Dropping at root level
        if (draggedTask.parentId !== null) {
          // Only update if it's not already a root task
          await updateTask(draggedId, { parentId: null, createdAt: Date.now() }); // Reset createdAt for new root order
        }
      } else {
        // Dropping on or near another item
        const targetTask = tasks.find(t => t.id === targetId);
        if (!targetTask) return;
        if (draggedId === targetId) return; // Cannot drop on itself

        let newParentId = targetTask.parentId;
        let newCreatedAt = targetTask.createdAt;

        if (position === 'inside') {
          newParentId = targetId;
          // When moving inside, new task should be last among children or have a new timestamp
          const childrenOfTarget = tasks.filter(t => t.parentId === targetId);
          newCreatedAt =
            childrenOfTarget.length > 0 ? Math.max(...childrenOfTarget.map(c => c.createdAt)) + 1000 : Date.now();
        } else {
          // 'before' or 'after'
          newParentId = targetTask.parentId; // Stays at the same level
          const siblings = tasks.filter(t => t.parentId === newParentId).sort((a, b) => a.createdAt - b.createdAt);
          const targetIndex = siblings.findIndex(t => t.id === targetId);

          if (position === 'before') {
            newCreatedAt =
              targetIndex > 0
                ? siblings[targetIndex - 1].createdAt +
                  Math.floor((targetTask.createdAt - siblings[targetIndex - 1].createdAt) / 2)
                : targetTask.createdAt - 1000;
          } else {
            // 'after'
            newCreatedAt =
              targetIndex < siblings.length - 1
                ? targetTask.createdAt + Math.floor((siblings[targetIndex + 1].createdAt - targetTask.createdAt) / 2)
                : targetTask.createdAt + 1000;
          }
        }
        // Prevent a task from becoming its own ancestor
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

  const handleQuickAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskInput.trim()) return;
    try {
      await createTask(quickTaskInput, undefined, null); // Create as root task
      setQuickTaskInput('');
      handleLocalTaskChange();
    } catch (error) {
      console.error('Error creating quick task:', error);
    }
  };

  const getRootTasks = () => tasks.filter(task => !task.parentId).sort((a, b) => a.createdAt - b.createdAt);
  const getChildTasks = (parentId: string) =>
    tasks.filter(task => task.parentId === parentId).sort((a, b) => a.createdAt - b.createdAt);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-600 dark:border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="relative pb-[140px] text-slate-800 dark:text-slate-100">
      {' '}
      {/* Increased padding for taller sticky form */}
      <div
        ref={listContainerRef}
        className={`min-h-[300px] p-1 rounded-md ${isDragOverRoot && !dragTargetItem ? 'border-2 border-dashed border-sky-400 dark:border-sky-600 bg-sky-50 dark:bg-sky-900/50' : ''}`}
        onDragOver={e => {
          e.preventDefault();
          // Only set drag over root if not over a specific item
          if (!dragTargetItem && e.target === listContainerRef.current) {
            setIsDragOverRoot(true);
          }
        }}
        onDragLeave={e => {
          if (e.target === listContainerRef.current) {
            setIsDragOverRoot(false);
          }
        }}
        onDrop={e => {
          // Handles dropping onto the root list area
          e.preventDefault();
          e.stopPropagation();
          const draggedId = e.dataTransfer.getData('taskId');
          // Ensure drop is directly on the list container, not on a child item that didn't handle its own drop
          if (e.target === listContainerRef.current && draggedId) {
            handleDropOnList(draggedId, null); // null targetId means root
          }
          setIsDragOverRoot(false);
        }}
      >
        {isDragOverRoot && !dragTargetItem && (
          <div className="text-center py-4 text-sky-600 dark:text-sky-300">Drop here to make it a root task</div>
        )}

        {getRootTasks().length === 0 && !isLoading ? (
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
            <p className="text-slate-400 dark:text-slate-500">
              Add your first task to get started using the form below.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {getRootTasks().map(task => (
              <TodoItem
                key={task.id}
                task={task}
                childTasks={getChildTasks(task.id)}
                getChildTasks={getChildTasks}
                onDrop={handleDropOnList}
                onTasksChange={handleLocalTaskChange}
                onDragOver={taskId => {
                  setDragTargetItem(taskId);
                }} // Let TodoItem signal hover
                dragTarget={dragTargetItem}
              />
            ))}
          </div>
        )}
      </div>
      {/* Sticky task input at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 {/* Adjust left for sidebar width on larger screens */} bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-20">
        <div className="max-w-3xl mx-auto px-4 py-3">
          {showFullForm ? (
            <TodoForm
              onTaskCreated={() => {
                handleLocalTaskChange();
                setShowFullForm(false); // Collapse after creation
              }}
              startExpanded={true} // Tell TodoForm to start expanded
            />
          ) : (
            <div className="p-1">
              {' '}
              {/* Reduced padding for compact quick add */}
              <form onSubmit={handleQuickAddTask} className="flex flex-col">
                <div className="mb-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add a new task..."
                    className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 transition-all text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
                    value={quickTaskInput}
                    onChange={e => {
                      setQuickTaskInput(e.target.value);
                    }}
                    required
                    maxLength={100}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded transition-colors disabled:opacity-50"
                    disabled={!quickTaskInput.trim()}
                  >
                    Add
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowFullForm(true);
                  }}
                  className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 text-sm flex items-center gap-1 self-start mt-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add task with description
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
