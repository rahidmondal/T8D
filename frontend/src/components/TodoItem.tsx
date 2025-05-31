import { useRef, useState } from 'react';

import { Task, TaskStatus } from '@src/models/Task';
import { deleteTask, updateTask } from '@src/utils/todo/todo';

import TodoForm from './TodoForm';

interface TodoItemProps {
  task: Task;
  childTasks: Task[];
  getChildTasks: (parentId: string) => Task[];
  onDrop: (draggedId: string, targetId: string | null, position?: 'before' | 'after' | 'inside') => void;
  onTasksChange: () => void;
  onDragOver?: (taskId: string) => void;
  dragTarget?: string | null;
}

export default function TodoItem({
  task,
  childTasks,
  getChildTasks,
  onDrop,
  onTasksChange,
  onDragOver,
  dragTarget,
}: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(task.name);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [dropPosition, setDropPosition] = useState<'before' | 'inside' | 'after'>('inside');

  const itemRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('parentId', task.parentId || 'null'); // Store parentId for reordering logic
    setIsDragging(true);
    // Optional: Add a class to the body to style the cursor or disable text selection
    document.body.classList.add('dragging');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    document.body.classList.remove('dragging');
    // Reset hover state for all items if needed, or rely on onDragLeave
    setIsHovering(false);
    if (onDragOver) onDragOver(''); // Clear drag target
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    if (!itemRef.current) return;

    if (onDragOver) onDragOver(task.id); // Signal which item is being hovered over

    const rect = itemRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    if (y < height * 0.25) {
      setDropPosition('before');
    } else if (y > height * 0.75) {
      setDropPosition('after');
    } else {
      setDropPosition('inside'); // Default to inside if in the middle
    }
    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
    // Do not clear dragTarget here, as dragOver on another item will set it
  };

  const handleDropInternal = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling up to parent drop zones

    const draggedId = e.dataTransfer.getData('taskId');
    if (draggedId === task.id) {
      // Prevent dropping onto itself
      setIsHovering(false);
      return;
    }

    await onDrop(draggedId, task.id, dropPosition);
    setIsHovering(false);
  };

  const handleStatusChange = async () => {
    try {
      await updateTask(task.id, {
        status: task.status === TaskStatus.COMPLETED ? TaskStatus.NOT_COMPLETED : TaskStatus.COMPLETED,
      });
      onTasksChange();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDelete = async () => {
    // Optional: Add a confirmation dialog here
    // if (!window.confirm(`Are you sure you want to delete "${task.name}"?`)) return;
    try {
      await deleteTask(task.id); // This should also delete children recursively if handled by backend/DB
      onTasksChange();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const promoteTask = async () => {
    try {
      await updateTask(task.id, { parentId: null });
      onTasksChange();
    } catch (error) {
      console.error('Error promoting task:', error);
    }
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  const startEditing = () => {
    setEditName(task.name);
    setEditDescription(task.description || '');
    setIsEditing(true);
  };

  const saveEdits = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!editName.trim()) return; // Basic validation
    try {
      await updateTask(task.id, {
        name: editName,
        description: editDescription || undefined, // Send undefined to clear if empty
      });
      setIsEditing(false);
      onTasksChange();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    // Optionally reset editName and editDescription if needed, though startEditing re-initializes them
  };

  const getDropIndicatorClass = () => {
    if (!isHovering || task.id !== dragTarget || dragTarget === e.dataTransfer.getData('taskId')) return ''; // Ensure dragTarget is this item and not the one being dragged
    if (dropPosition === 'before') {
      return 'before:absolute before:left-0 before:right-0 before:top-0 before:h-1 before:bg-sky-500 dark:before:bg-sky-400 before:-translate-y-0.5 before:z-10';
    } else if (dropPosition === 'after') {
      return 'after:absolute after:left-0 after:right-0 after:bottom-0 after:h-1 after:bg-sky-500 dark:after:bg-sky-400 after:translate-y-0.5 after:z-10';
    }
    // For 'inside', we might change the background or border of the item itself
    return '';
  };

  const isDropTargetInside =
    isHovering && task.id === dragTarget && dropPosition === 'inside' && task.id !== e.dataTransfer.getData('taskId');

  if (isEditing) {
    return (
      <div className="mb-2">
        <div className="p-3 border border-sky-300 dark:border-sky-700 rounded-lg shadow-sm bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100">
          <form onSubmit={saveEdits} className="space-y-3">
            <div>
              <input
                type="text"
                value={editName}
                onChange={e => {
                  setEditName(e.target.value);
                }}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 transition-all bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                required
                maxLength={100}
                autoFocus
              />
            </div>
            <div>
              <textarea
                value={editDescription}
                onChange={e => {
                  setEditDescription(e.target.value);
                }}
                placeholder="Description (optional)"
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 transition-all bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                rows={3}
                maxLength={500}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2 relative">
      {' '}
      {/* Added relative for drop indicators */}
      <div
        ref={itemRef}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropInternal}
        onDragEnd={handleDragEnd}
        className={`task-item p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 relative
        ${isDragging ? 'opacity-50 border-dashed border-sky-500 dark:border-sky-400' : 'border-slate-300 dark:border-slate-700'}
        ${isDropTargetInside ? 'bg-sky-50 dark:bg-sky-500/20 border-sky-400 dark:border-sky-600' : ''}
        ${getDropIndicatorClass()}`}
      >
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={task.status === TaskStatus.COMPLETED}
            onChange={handleStatusChange}
            className="w-4 h-4 accent-sky-600 dark:accent-sky-500 bg-slate-100 border-slate-300 rounded focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
          />

          <span
            className={`flex-1 ${
              task.status === TaskStatus.COMPLETED
                ? 'line-through text-slate-500 dark:text-slate-400'
                : 'font-medium text-slate-800 dark:text-slate-100'
            } cursor-pointer`}
            onClick={toggleAddForm}
          >
            {task.name}
          </span>

          <div className="flex gap-1">
            {' '}
            {/* Reduced gap for icon buttons */}
            <button
              onClick={startEditing}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 focus:outline-none"
              title="Edit task"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={toggleAddForm}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 focus:outline-none"
              title="Add subtask"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            {task.parentId && (
              <button
                onClick={promoteTask}
                className="p-1 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 focus:outline-none"
                title="Move to root level"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            )}
            {(childTasks.length > 0 || task.parentId) && ( // Show expand/collapse if it has children or is a child (to allow collapsing empty sub-lists)
              <button
                onClick={() => {
                  setIsExpanded(!isExpanded);
                }}
                className="p-1 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 focus:outline-none"
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none"
              title="Delete"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
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
        </div>

        {task.description && !isEditing && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 ml-8">{task.description}</p>
        )}
      </div>
      {showAddForm && (
        <div className="ml-8 mt-2 mb-2">
          {' '}
          {/* Indent sub-task form */}
          <TodoForm
            parentId={task.id}
            onTaskCreated={() => {
              onTasksChange();
              setShowAddForm(false); // Close form after sub-task creation
            }}
          />
        </div>
      )}
      {isExpanded && childTasks.length > 0 && (
        <div className="ml-6 mt-2 border-l-2 border-slate-300 dark:border-slate-700 pl-3">
          {childTasks.map(childTask => (
            <TodoItem
              key={childTask.id}
              task={childTask}
              childTasks={getChildTasks(childTask.id)}
              getChildTasks={getChildTasks}
              onDrop={onDrop}
              onTasksChange={onTasksChange}
              onDragOver={onDragOver}
              dragTarget={dragTarget}
            />
          ))}
        </div>
      )}
    </div>
  );
}
