import { useState } from 'react';
import { createTask } from '../utils/todo/todo';

interface TodoFormProps {
  parentId?: string | null;
  onTaskCreated: () => void;
}

export default function TodoForm({ parentId = null, onTaskCreated }: TodoFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createTask(name, description || undefined, parentId);
      setName('');
      setDescription('');
      setIsExpanded(false);
      onTaskCreated();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-4 p-4 border rounded-lg shadow-sm bg-white text-gray-900">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all text-gray-900"
            required
            autoFocus
            maxLength={100}
          />
        </div>

        {isExpanded ? (
          <div className="mb-3">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add details (optional)"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-500 transition-all text-gray-900"
              rows={3}
              maxLength={500}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="mb-3 text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1"
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
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </button>
          <button
            type="button"
            onClick={() => {
              onTaskCreated();
              setName('');
              setDescription('');
              setIsExpanded(false);
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
