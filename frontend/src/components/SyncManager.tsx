import { useState } from 'react';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
type AuthView = 'login' | 'register';

function SyncManager() {
  const [view, setView] = useState<AuthView>('login');

  return (
    <div className="w-full max-w-xl mx-auto p-6 text-slate-800 dark:text-slate-200">
      <h2 className="text-2xl font-semibold mb-6">Sync Manager</h2>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm">
        <div className="flex border-b border-slate-300 dark:border-slate-700">
          <button
            onClick={() => {
              setView('login');
            }}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center focus:outline-none transition-colors rounded-tl-lg ${
              view === 'login'
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setView('register');
            }}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center focus:outline-none transition-colors rounded-tr-lg ${
              view === 'register'
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Register
          </button>
        </div>

        <div>
          {view === 'login' && <LoginForm />}
          {view === 'register' && <RegisterForm />}
        </div>
      </div>
    </div>
  );
}

export default SyncManager;
