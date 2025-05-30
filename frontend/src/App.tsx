import React, { useState } from 'react';

import './App.css';
import DateTime from './components/DateTime';
import Settings from './components/Settings';
import { SideBar } from './components/sidebar';
import TodoList from './components/TodoList';

const App: React.FC = () => {
  const [selectedView, setSelectedView] = useState('tasks');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTaskChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      {' '}
      {/* Apply base background */}
      <aside className="w-64 shadow-md z-10">
        {' '}
        {/* Needs light/dark styles */}
        <SideBar selectedView={selectedView} onSelectView={setSelectedView} />
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {' '}
        {/* Needs light/dark styles */}
        {selectedView === 'tasks' && (
          <div className="max-w-3xl mx-auto">
            <header className="mb-6 flex items-center justify-between">
              <div>
                {/* Text colors will be updated in their respective components */}
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Tasks</h1>
                <p className="text-slate-600 dark:text-slate-300">Organize your work and life</p>
              </div>
              <DateTime />
            </header>
            <TodoList key={refreshTrigger} onTaskChange={handleTaskChange} />
          </div>
        )}
        {selectedView === 'settings' && <Settings />}
      </main>
    </div>
  );
};

export default App;
