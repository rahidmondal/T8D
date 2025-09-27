import { useEffect } from 'react';

interface ShortcutMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const globalShortcuts = [
  { key: 'n', description: 'New top-level task' },
  { key: '?', description: 'Open this shortcuts menu' },
  { key: 'Escape', description: 'Close forms or cancel actions' },
];

const taskShortcuts = [
  { key: '↑ / ↓', description: 'Move focus between tasks' },
  { key: '→', description: 'Expand or enter subtasks' },
  { key: '←', description: 'Collapse or exit to parent' },
  { key: 'Space', description: 'Toggle task completion' },
  { key: 'Enter', description: 'Edit task/tasklist' },
  { key: 'a', description: 'Add a subtask' },
  { key: 'Shift + Enter', description: 'Add a sibling task' },
  { key: 'Tab', description: 'Indent task' },
  { key: 'Shift + Tab', description: 'Outdent task (Promote)' },
  { key: 'Delete', description: 'Delete task' },
  { key: 'l', description: 'Add new task list' },
];

const ShortcutDisplay = ({ shortcut }: { shortcut: { key: string; description: string } }) => (
  <div className="flex justify-between items-center py-2">
    <p className="text-slate-600 dark:text-slate-300">{shortcut.description}</p>
    <kbd className="px-2 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg dark:bg-slate-600 dark:text-slate-100 dark:border-slate-500">
      {shortcut.key}
    </kbd>
  </div>
);

export default function ShortcutMenu({ isOpen, onClose }: ShortcutMenuProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/75 flex items-center justify-center z-50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4"
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Close shortcuts menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Global</h3>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {globalShortcuts.map(shortcut => (
                <ShortcutDisplay key={shortcut.key} shortcut={shortcut} />
              ))}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">When a Task is Focused</h3>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {taskShortcuts.map(shortcut => (
                <ShortcutDisplay key={shortcut.key} shortcut={shortcut} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
