import React from 'react';

import { useTheme } from '@src/hooks/useTheme';

import { Backup } from './Backup';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const handleToggleClick = () => {
    toggleTheme();
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 text-slate-800 dark:text-slate-200">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>
      <section className="mb-8">
        <h3 className="text-lg font-medium mb-4">Theme Settings</h3>
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
          <span className="font-medium">Dark Mode</span>
          <button
            type="button"
            aria-pressed={theme === 'dark'}
            onClick={handleToggleClick}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800 ${
              theme === 'dark' ? 'bg-sky-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                theme === 'dark' ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Toggle to switch between light and dark mode.</p>
      </section>
      <Backup />
    </div>
  );
};

export default Settings;
