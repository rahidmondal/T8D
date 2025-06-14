import logo from '@src/assets/t8d512.jpg';

type SideBarProps = {
  selectedView: string;
  onSelectView: (view: string) => void;
  setSidebarOpen?: (open: boolean) => void; // Add this prop
};

export const SideBar: React.FC<SideBarProps> = ({ selectedView, onSelectView, setSidebarOpen }) => {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
      <div className="flex flex-col justify-center items-center bg-gradient-to-r from-sky-600 to-sky-500 dark:from-sky-700 dark:to-sky-600 text-white py-6 shadow-md">
        <img src={logo} alt="T8D logo" className="h-16 w-16 mb-2 rounded-lg shadow-md object-cover" />
        <h1 className="text-xl font-bold">T8D</h1>
        <p className="text-sm text-sky-100 dark:text-sky-200">Task Manager</p>
      </div>

      {typeof window !== 'undefined' && window.innerWidth < 1024 && (
        <button
          className="block lg:hidden ml-auto mb-2 p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100"
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className="p-4 flex-1">
        <nav className="space-y-1">
          <button
            onClick={() => {
              onSelectView('tasks');
            }}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-md font-medium transition-colors duration-150 ${
              selectedView === 'tasks'
                ? 'bg-sky-100 dark:bg-sky-700 text-sky-700 dark:text-sky-100'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <svg
              className="mr-3 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            My Tasks
          </button>
          <button
            onClick={() => {
              onSelectView('settings');
            }}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-md font-medium transition-colors duration-150 ${
              selectedView === 'settings'
                ? 'bg-sky-100 dark:bg-sky-700 text-sky-700 dark:text-sky-100'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <svg
              className="mr-3 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </nav>
      </div>

      <div className="flex justify-center p-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        {' '}
        <p>T8D v0.2.3</p>
      </div>
    </div>
  );
};
