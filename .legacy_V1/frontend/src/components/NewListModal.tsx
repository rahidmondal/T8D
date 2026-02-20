import React, { useEffect, useRef, useState } from 'react';

interface NewListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

const NewListModal: React.FC<NewListModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setName('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm m-4"
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">Create New List</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="list-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            List Name
          </label>
          <input
            id="list-name"
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => {
              setName(e.target.value);
            }}
            placeholder="e.g., Work Project"
            className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition-all text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 text-base"
            required
            maxLength={50}
          />
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded transition-colors disabled:opacity-50"
              disabled={!name.trim()}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewListModal;
