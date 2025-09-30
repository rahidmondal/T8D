import React, { useEffect, useRef, useState } from 'react';

import SubtaskCountBadge from '@src/components/SubtaskCountBadge';
import TodoForm from '@src/components/TodoForm';
import { useTaskLists } from '@src/hooks/useTaskLists';
import { Task, TaskStatus } from '@src/models/Task';
import { deleteTask, getTask, updateTask } from '@src/utils/todo/todo';

interface TodoItemProps {
  task: Task;
  childTasks: Task[];
  getChildTasks: (parentId: string | null) => Task[];
  onDrop: (draggedId: string, targetId: string | null, position?: 'before' | 'after' | 'inside') => void;
  onTasksChange: (formIdToFocus?: string | null) => void;
  loadTasks: () => Promise<void>;
  onDragOver: ((taskId: string | null) => void) | undefined;
  dragTarget?: string | null | undefined;
  expandedState: Record<string, boolean> | undefined;
  setExpandedState: ((state: Record<string, boolean>) => void) | undefined;
  focusedTaskId?: string | null | undefined;
  setFocusedTaskId: (id: string | null) => void;
  registerItemRef: (el: HTMLDivElement | null, id: string) => void;
  onAddSibling: (taskId: string) => void;
  onIndentTask: (taskId: string) => void;
  onTaskAdded: (newTask: Task) => void;
}

export default function TodoItem({
  task,
  childTasks,
  getChildTasks,
  onDrop,
  onTasksChange,
  loadTasks,
  onDragOver,
  dragTarget,
  expandedState,
  setExpandedState,
  focusedTaskId,
  setFocusedTaskId,
  registerItemRef,
  onAddSibling,
  onIndentTask,
  onTaskAdded,
}: TodoItemProps) {
  const { activeListId } = useTaskLists();
  const isFocused = focusedTaskId === task.id;
  const isExpandedDefault = expandedState?.[task.id] ?? true;
  const [isExpanded, setIsExpanded] = useState(isExpandedDefault);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (expandedState && typeof expandedState[task.id] === 'boolean') {
      setIsExpanded(expandedState[task.id]);
    }
  }, [expandedState, task.id]);

  const setExpanded = (expanded: boolean) => {
    setIsExpanded(expanded);
    if (setExpandedState) {
      setExpandedState({
        ...(expandedState || {}),
        [task.id]: expanded,
      });
    }
  };

  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(task.name);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [dropPosition, setDropPosition] = useState<'before' | 'inside' | 'after'>('inside');

  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerItemRef(itemRef.current, task.id);
    return () => {
      registerItemRef(null, task.id);
    };
  }, [task.id, registerItemRef]);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('parentId', task.parentId || 'null');
    setIsDragging(true);
    document.body.classList.add('dragging');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    document.body.classList.remove('dragging');
    setIsHovering(false);
    onDragOver?.(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!itemRef.current) {
      return;
    }
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

  const handleDropInternal = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('taskId');
    if (draggedId === task.id) {
      setIsHovering(false);
      return;
    }
    onDrop(draggedId, task.id, dropPosition);
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
      if (!task.parentId) {
        return;
      }
      const parentTask = await getTask(task.parentId);
      const newParentId = parentTask?.parentId ?? null;
      await updateTask(task.id, { parentId: newParentId });
      onTasksChange(task.id);
    } catch (error) {
      console.error('Error promoting task:', error);
    }
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    if (!showAddForm) {
      setExpanded(true);
    }
  };

  const startEditing = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setEditName(task.name);
    setEditDescription(task.description || '');
    setIsEditing(true);
    setFocusedTaskId(null);
  };

  const saveEdits = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!editName.trim()) {
      return;
    }
    try {
      await updateTask(task.id, {
        name: editName,
        description: editDescription || '',
      });
      setIsEditing(false);
      onTasksChange();
      setFocusedTaskId(task.id);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFocusedTaskId(task.id);
  };

  const handleWrapperDoubleClick = () => {
    if (childTasks.length > 0) {
      setExpanded(!isExpanded);
    }
  };

  const handleFocusFromForm = () => {
    setFocusedTaskId(task.id);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    itemRef.current?.focus();
  };

  const handleItemKeyDown = (e: React.KeyboardEvent) => {
    let isHandled = true;

    if (e.shiftKey && e.key === 'Enter') {
      onAddSibling(task.id);
    } else {
      switch (e.key) {
        case 'Enter': {
          startEditing(e);
          break;
        }
        case ' ': {
          void handleStatusChange();
          break;
        }
        case 'a': {
          toggleAddForm();
          break;
        }
        case 'Delete': {
          void handleDelete();
          break;
        }
        case 'ArrowLeft': {
          if (isExpanded) {
            setExpanded(false);
          } else if (task.parentId) {
            setFocusedTaskId(task.parentId);
          }
          break;
        }
        case 'ArrowRight': {
          if (!isExpanded && childTasks.length > 0) {
            setExpanded(true);
          } else if (childTasks.length > 0) {
            setFocusedTaskId(childTasks[0].id);
          }
          break;
        }
        case 'Tab': {
          if (e.shiftKey) {
            void promoteTask();
          } else {
            onIndentTask(task.id);
          }
          break;
        }
        default: {
          isHandled = false;
          break;
        }
      }
    }

    if (isHandled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const totalSubtasks = childTasks.length;
  const completedSubtask = childTasks.filter(subtask => subtask.status === TaskStatus.COMPLETED).length;

  const getDropIndicatorClass = () => {
    if (!isHovering || task.id !== dragTarget) {
      return '';
    }
    if (dropPosition === 'before') {
      return 'before:absolute before:left-0 before:right-0 before:top-0 before:h-1 before:bg-sky-500 dark:before:bg-sky-400 before:-translate-y-0.5 before:z-10';
    }
    if (dropPosition === 'after') {
      return 'after:absolute after:left-0 after:right-0 after:bottom-0 after:h-1 after:bg-sky-500 dark:after:bg-sky-400 after:translate-y-0.5 after:z-10';
    }
    return '';
  };

  const isDropTargetInside = isHovering && task.id === dragTarget && dropPosition === 'inside';

  if (isEditing) {
    return (
      <div className="mb-2">
        <div className="p-3 border border-sky-300 dark:border-sky-700 rounded-lg shadow-sm bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100">
          <form
            onSubmit={e => {
              void saveEdits(e);
            }}
            className="space-y-3"
          >
            <div>
              <input
                type="text"
                value={editName}
                onChange={e => {
                  setEditName(e.target.value);
                }}
                onKeyDown={e => {
                  if (e.key === 'Escape') {
                    e.stopPropagation();
                    cancelEditing();
                  }
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
                onKeyDown={e => {
                  if (e.key === 'Escape') {
                    e.stopPropagation();
                    cancelEditing();
                  }
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
      <div
        ref={itemRef}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropInternal}
        onDragEnd={handleDragEnd}
        onDoubleClick={handleWrapperDoubleClick}
        onKeyDown={handleItemKeyDown}
        tabIndex={-1}
        className={`task-item p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 relative focus:outline-none ${
          isFocused ? 'ring-2 ring-sky-500 dark:ring-sky-400' : ''
        } ${
          isDragging
            ? 'opacity-50 border-dashed border-sky-500 dark:border-sky-400'
            : 'border-slate-300 dark:border-slate-700'
        } ${isDropTargetInside ? 'bg-sky-50 dark:bg-sky-500/20 border-sky-400 dark:border-sky-600' : ''} ${getDropIndicatorClass()}`}
      >
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={task.status === TaskStatus.COMPLETED}
            onChange={() => {
              void handleStatusChange();
            }}
            className="w-4 h-4 accent-sky-600 dark:accent-sky-500 bg-slate-100 border-slate-300 rounded focus:ring-sky-500 dark:focus:ring-sky-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
          />
          <span
            className={`flex-1 break-words min-w-0 ${
              task.status === TaskStatus.COMPLETED
                ? 'line-through text-slate-500 dark:text-slate-400'
                : 'font-medium text-slate-800 dark:text-slate-100'
            } cursor-pointer flex items-center gap-2`}
            onClick={toggleAddForm}
          >
            <span
              className="hover:underline focus:underline outline-none"
              title="Double-click to edit"
              onDoubleClick={e => {
                e.stopPropagation();
                startEditing(e);
              }}
              role="button"
              aria-label="Edit task name"
              style={{ userSelect: 'text' }}
            >
              {task.name}
            </span>
            <SubtaskCountBadge completed={completedSubtask} total={totalSubtasks} />
          </span>
          <div className="flex gap-1">
            <button
              onClick={e => {
                startEditing(e);
              }}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 focus:outline-none"
              title="Edit task"
              tabIndex={-1}
              data-edit-button
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
              tabIndex={-1}
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
                onClick={() => {
                  void promoteTask();
                }}
                className="p-1 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 focus:outline-none"
                title="Promote level"
                tabIndex={-1}
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
                onClick={() => {
                  setExpanded(!isExpanded);
                }}
                className="p-1 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 focus:outline-none"
                title={isExpanded ? 'Collapse' : 'Expand'}
                tabIndex={-1}
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
              onClick={() => {
                void handleDelete();
              }}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none"
              title="Delete"
              tabIndex={-1}
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

        {task.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 ml-8">{task.description}</p>}
      </div>
      {showAddForm && activeListId && (
        <div className="ml-8 mt-2 mb-2">
          <TodoForm
            taskListId={activeListId}
            parentId={task.id}
            onTaskCreated={onTaskAdded}
            onCancel={handleFormCancel}
            onFocusParent={handleFocusFromForm}
            autoFocus
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
              loadTasks={loadTasks}
              onDragOver={onDragOver}
              dragTarget={dragTarget}
              expandedState={expandedState}
              setExpandedState={setExpandedState}
              focusedTaskId={focusedTaskId}
              setFocusedTaskId={setFocusedTaskId}
              registerItemRef={registerItemRef}
              onAddSibling={onAddSibling}
              onIndentTask={onIndentTask}
              onTaskAdded={onTaskAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
