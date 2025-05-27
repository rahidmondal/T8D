import React, { useState } from 'react';

import './App.css';
import DateTime from './components/DateTime';
import Settings from './components/Settings';
import { SideBar } from './components/sidebar';
import TodoList from './components/TodoList';
// import MyTasks from './components/MyTasks'; // Uncomment and use your actual tasks component

const App: React.FC = () => {
  const [selectedView, setSelectedView] = useState('tasks');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTaskChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 shadow-md z-10">
        <SideBar selectedView={selectedView} onSelectView={setSelectedView} />
      </aside>

      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        {selectedView === 'tasks' && (
          // <MyTasks /> // Replace with your actual tasks component
          <div className="max-w-3xl mx-auto">
            <header className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
                <p className="text-gray-600">Organize your work and life</p>
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
