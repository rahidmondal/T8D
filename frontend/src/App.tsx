import { useState } from 'react';

import './App.css';
import { SideBar } from './components/sidebar';
import TodoList from './components/TodoList';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTaskChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 shadow-md z-10">
        <SideBar />
      </aside>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
            <p className="text-gray-600">Organize your work and life</p>
          </header>

          <TodoList key={refreshTrigger} onTaskChange={handleTaskChange} />
        </div>
      </main>
    </div>
  );
}

export default App;
