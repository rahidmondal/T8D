import './App.css';

import { useEffect, useRef, useState } from 'react';

import { Bars3Icon } from '@heroicons/react/24/outline';
import Settings from '@src/components/Settings';
import ShortcutMenu from '@src/components/ShortcutMenu';
import Sidebar from '@src/components/Sidebar';
import { TaskListProvider } from '@src/components/TaskListProvider';
import TodoList from '@src/components/TodoList';

type View = 'todolist' | 'settings';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isShortcutMenuOpen, setShortcutMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('todolist');
  const mainFormRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setSidebarOpen(false);
        setShortcutMenuOpen(false);
        const activeElement = document.activeElement;
        if (activeElement && 'blur' in activeElement) {
          (activeElement as HTMLElement).blur();
        }
        return;
      }
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
      if (e.key === '?') {
        e.preventDefault();
        setShortcutMenuOpen(true);
      }
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        mainFormRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <TaskListProvider>
      <div className="relative flex h-screen bg-slate-100 dark:bg-slate-900 lg:flex-row">
        {/* Mobile Hamburger Menu */}
        <button
          className="lg:hidden fixed top-4 left-4 z-30 bg-sky-600 text-white p-2 rounded-md shadow-lg"
          onClick={() => {
            setSidebarOpen(true);
          }}
          aria-label="Open sidebar"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        <aside
          className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-slate-800 transition-transform transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } w-64 shadow-lg lg:static lg:translate-x-0 lg:shadow-none`}
        >
          <Sidebar
            currentView={currentView}
            onNavigate={view => {
              setCurrentView(view);
              setSidebarOpen(false);
            }}
            setSidebarOpen={setSidebarOpen}
          />
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => {
              setSidebarOpen(false);
            }}
            aria-hidden="true"
          ></div>
        )}

        <main className="flex-1 flex flex-col overflow-hidden">
          {currentView === 'todolist' && <TodoList ref={mainFormRef} />}
          {currentView === 'settings' && (
            <div className="w-full p-4 sm:p-6 md:p-8 overflow-y-auto">
              <div className="pl-12 lg:pl-6">
                <Settings />
              </div>
            </div>
          )}
        </main>
      </div>

      <ShortcutMenu
        isOpen={isShortcutMenuOpen}
        onClose={() => {
          setShortcutMenuOpen(false);
        }}
      />
    </TaskListProvider>
  );
}

export default App;
