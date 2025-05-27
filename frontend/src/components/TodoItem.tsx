import { useRef, useState } from 'react';
import { Task, TaskStatus } from '../models/Task';
import { deleteTask, updateTask } from '../utils/todo/todo';
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
    e.dataTransfer.setData('parentId', task.parentId || 'null');
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!itemRef.current) return;

    onDragOver?.(task.id);

    const rect = itemRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    if (y < height * 0.25) {
      setDropPosition('before');
    } else if (y > height * 0.75) {
      setDropPosition('after');
    } else {
      setDropPosition('inside');
    }

    setIsHovering(true);
  };

  const handleDragLeave = () => {
    setIsHovering(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = e.dataTransfer.getData('taskId');
    if (draggedId === task.id) {
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
    try {
      await deleteTask(task.id);
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
    if (!editName.trim()) return;
    try {
      await updateTask(task.id, {
        name: editName,
        description: editDescription || undefined,
      });
      setIsEditing(false);
      onTasksChange();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const getDropIndicatorClass = () => {
    if (!isHovering || task.id !== dragTarget) return '';
    if (dropPosition === 'before') {
      return 'before:absolute before:left-0 before:right-0 before:top-0 before:h-1 before:bg-purple-500 before:-translate-y-0.5';
    } else if (dropPosition === 'after') {
      return 'after:absolute after:left-0 after:right-0 after:bottom-0 after:h-1 after:bg-purple-500 after:translate-y-0.5';
    }
    return '';
  };

  if (isEditing) {
    return (
      <div className="mb-2">
        <div className="p-3 border rounded-lg shadow-sm mb-2 bg-white border-purple-300 text-gray-900">
          <form onSubmit={saveEdits} className="space-y-3">
            <div>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 text-gray-900"
                required
                maxLength={100}
                autoFocus
              />
            </div>
            <div>
              <textarea
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 text-gray-900"
                rows={3}
                maxLength={500}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
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
    <div className="mb-2">
      <div
        ref={itemRef}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={() => setIsDragging(false)}
        className={`task-item p-3 border rounded-lg shadow-sm mb-2 hover:shadow-md transition-shadow bg-white relative text-gray-900
        ${isDragging ? 'opacity-50 border-dashed' : ''}
        ${
          isHovering && task.id === dragTarget
            ? `border-purple-500 ${dropPosition === 'inside' ? 'bg-purple-50' : 'bg-white'}`
            : 'border-gray-200'
        }
        ${getDropIndicatorClass()}`}
      >
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={task.status === TaskStatus.COMPLETED}
            onChange={handleStatusChange}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />

          <span
            className={`flex-1 ${
              task.status === TaskStatus.COMPLETED ? 'line-through text-gray-500' : 'font-medium text-gray-900'
            } cursor-pointer`}
            onClick={toggleAddForm}
          >
            {task.name}
          </span>

          <div className="flex gap-2">
            <button
              onClick={startEditing}
              className="text-gray-500 hover:text-purple-600 focus:outline-none"
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
              className="text-gray-500 hover:text-purple-600 focus:outline-none"
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
                className="text-gray-500 hover:text-purple-600 focus:outline-none"
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

            {childTasks.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 hover:text-purple-600 focus:outline-none"
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
              className="text-gray-500 hover:text-red-500 focus:outline-none"
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

        {task.description && <p className="text-sm text-gray-600 mt-2 ml-6">{task.description}</p>}
      </div>

      {showAddForm && (
        <div className="ml-6 mb-2">
          <TodoForm
            parentId={task.id}
            onTaskCreated={() => {
              onTasksChange();
              setShowAddForm(false);
            }}
          />
        </div>
      )}

      {isExpanded && childTasks.length > 0 && (
        <div className="ml-6 mt-2 border-l-2 border-gray-200 pl-3">
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
