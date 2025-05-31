import { useState } from 'react';

import { createTask } from '../utils/todo/todo';

interface TodoFormProps {
  parentId?: string | null;
  onTaskCreated: () => void;
  startExpanded?: boolean;
}

export default function TodoForm({ parentId = null, onTaskCreated, startExpanded = false }: TodoFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(startExpanded);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createTask(name, description || undefined, parentId);
      setName('');
      setDescription('');
      setIsExpanded(startExpanded || false);
      onTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-4 p-4 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            value={name}
            onChange={e => {
              setName(e.target.value);
            }}
            placeholder="What needs to be done?"
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 transition-all text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
            required
            autoFocus={!parentId}
            maxLength={100}
          />
        </div>

        {isExpanded ? (
          <div className="mb-3">
            <textarea
              value={description}
              onChange={e => {
                setDescription(e.target.value);
              }}
              placeholder="Add details (optional)"
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:border-sky-500 dark:focus:border-sky-400 transition-all text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-400 dark:placeholder-slate-500"
              rows={3}
              maxLength={500}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setIsExpanded(true);
            }}
            className="mb-3 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 text-sm flex items-center gap-1"
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
            Add description
          </button>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </button>
          {/* Show cancel button only if it's an expanded form or has content */}
          {(isExpanded || name || description) && (
            <button
              type="button"
              onClick={() => {
                // If it's a sub-task form, onTaskCreated might close it.
                // Otherwise, just clear and collapse.
                if (parentId) {
                  onTaskCreated(); // This typically reloads tasks and might hide the form
                }
                setName('');
                setDescription('');
                setIsExpanded(startExpanded || false);
              }}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
