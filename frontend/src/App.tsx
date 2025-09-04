import React, { useState } from 'react';

import DateTime from '@components/DateTime';
import Settings from '@components/Settings';
import { SideBar } from '@components/Sidebar';
import TodoForm from '@components/TodoForm';
import TodoList from '@components/TodoList';

import '@src/App.css';

const App: React.FC = () => {
  const [selectedView, setSelectedView] = useState('tasks');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTaskChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 lg:flex-row">
      <button
        className="lg:hidden fixed top-4 left-4 z-40 bg-sky-600 text-white p-2 rounded"
        onClick={() => {
          setSidebarOpen(true);
        }}
        aria-label="Open sidebar"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-slate-800 transition-transform transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 shadow-md lg:static lg:translate-x-0 lg:w-64`}
      >
        <SideBar
          selectedView={selectedView}
          onSelectView={view => {
            setSelectedView(view);
            setSidebarOpen(false);
          }}
          setSidebarOpen={setSidebarOpen}
        />
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedView === 'tasks' && (
          <div className="flex flex-col h-full">
            <header className="p-2 sm:p-4 md:p-6 mb-0 flex-shrink-0 flex flex-row items-start sm:items-center justify-between gap-2 pl-16 lg:pl-6">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">My Tasks</h1>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">Organize your work and life</p>
              </div>
              <div>
                <DateTime />
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6">
              <div className="max-w-full sm:max-w-3xl mx-auto">
                <TodoList key={refreshTrigger} onTaskChange={handleTaskChange} />
              </div>
            </div>

            <footer className="flex-shrink-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-20">
              <div className="max-w-3xl mx-auto p-2 sm:p-4">
                <TodoForm parentId={null} onTaskCreated={handleTaskChange} />
              </div>
            </footer>
          </div>
        )}
        {selectedView === 'settings' && (
          <div className="w-full p-4 sm:p-6 md:p-8 overflow-y-auto">
            <div className="pl-12 lg:pl-6">
              <Settings />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
