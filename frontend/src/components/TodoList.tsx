import { useEffect, useState } from 'react';

import { Task } from '../models/Task';
import { createTask, getAllTasks, updateTask } from '../utils/todo/todo';

import TodoForm from './TodoForm';
import TodoItem from './TodoItem';

interface TodoListProps {
  onTaskChange?: () => void;
}

export default function TodoList({ onTaskChange = () => {} }: TodoListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [quickTaskInput, setQuickTaskInput] = useState('');
  const [showFullForm, setShowFullForm] = useState(false);
  const [dragTarget, setDragTarget] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const allTasks = await getAllTasks();
      setTasks(allTasks.sort((a, b) => a.createdAt - b.createdAt));
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskChange = () => {
    loadTasks();
    onTaskChange();
  };

  const handleDrop = async (
    draggedId: string,
    targetId: string | null,
    position: 'before' | 'after' | 'inside' = 'inside',
  ) => {
    try {
      const draggedTask = tasks.find(t => t.id === draggedId);
      const targetTask = targetId ? tasks.find(t => t.id === targetId) : null;

      if (!draggedTask) return;

      // If dropping on the same task, do nothing
      if (draggedId === targetId) return;

      // If moving to a new parent
      if (position === 'inside') {
        await updateTask(draggedId, { parentId: targetId });
      }
      // If reordering at the same level
      else {
        // First, ensure the dragged task is at the same level as the target (same parent)
        const parentId = targetTask?.parentId || null;

        // Get all tasks at this level, ordered by creation time
        const tasksAtLevel = tasks.filter(task => task.parentId === parentId).sort((a, b) => a.createdAt - b.createdAt);

        // Find the indices
        const targetIndex = tasksAtLevel.findIndex(t => t.id === targetId);

        // Calculate the new timestamp based on the target task and position
        let newTimestamp: number;

        if (position === 'before') {
          // If dropping before, use timestamp just before the target
          const prevTask = targetIndex > 0 ? tasksAtLevel[targetIndex - 1] : null;

          if (prevTask) {
            // Place between previous and target
            newTimestamp = prevTask.createdAt + Math.floor((targetTask!.createdAt - prevTask.createdAt) / 2);
          } else {
            // Place before target
            newTimestamp = targetTask!.createdAt - 1000;
          }
        } else {
          // 'after'
          // If dropping after, use timestamp just after the target
          const nextTask = targetIndex < tasksAtLevel.length - 1 ? tasksAtLevel[targetIndex + 1] : null;

          if (nextTask) {
            // Place between target and next
            newTimestamp = targetTask!.createdAt + Math.floor((nextTask.createdAt - targetTask!.createdAt) / 2);
          } else {
            // Place after target
            newTimestamp = targetTask!.createdAt + 1000;
          }
        }

        // Update the task with new parent (if changed) and new timestamp
        await updateTask(draggedId, {
          parentId: parentId,
          createdAt: newTimestamp,
        });
      }

      // Refresh the tasks
      await loadTasks();
      onTaskChange();
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const handleQuickAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskInput.trim()) return;

    try {
      await createTask(quickTaskInput);
      setQuickTaskInput('');
      handleTaskChange();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Get tasks with no parent (root tasks)
  const getRootTasks = () => tasks.filter(task => !task.parentId);

  // Get child tasks for a specific parent
  const getChildTasks = (parentId: string) => tasks.filter(task => task.parentId === parentId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="relative pb-[120px] text-gray-900">
      <div
        className="min-h-[300px]"
        onDragOver={e => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => {
          setIsDragOver(false);
        }}
        onDrop={e => {
          e.preventDefault();
          const draggedId = e.dataTransfer.getData('taskId');
          if (e.target instanceof Element && !e.target.closest('.task-item')) {
            handleDrop(draggedId, null);
          }
          setIsDragOver(false);
          setDragTarget(null);
        }}
      >
        {isDragOver && !dragTarget && (
          <div className="border-2 border-dashed border-purple-400 rounded-lg p-4 mb-6 bg-purple-50 text-center">
            <p className="text-purple-600">Drop here to move to root level</p>
          </div>
        )}

        {getRootTasks().length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">No tasks yet</p>
            <p className="text-gray-400">Add your first task to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {getRootTasks().map(task => (
              <TodoItem
                key={task.id}
                task={task}
                childTasks={getChildTasks(task.id)}
                onDrop={handleDrop}
                onTasksChange={handleTaskChange}
                onDragOver={taskId => {
                  setDragTarget(taskId);
                }}
                dragTarget={dragTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky task input at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {showFullForm ? (
            <TodoForm
              onTaskCreated={() => {
                handleTaskChange();
                setShowFullForm(false);
              }}
            />
          ) : (
            <div className="p-3 border rounded-lg shadow-sm bg-white">
              <form onSubmit={handleQuickAddTask} className="flex flex-col">
                <div className="mb-2 flex items-center">
                  <input
                    type="text"
                    placeholder="Add a new task..."
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all text-gray-900"
                    value={quickTaskInput}
                    onChange={e => {
                      setQuickTaskInput(e.target.value);
                    }}
                    required
                    maxLength={100}
                  />
                  <button
                    type="submit"
                    className="ml-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                  >
                    Add Task
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowFullForm(true);
                  }}
                  className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1 self-start"
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
