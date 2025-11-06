import { useState } from 'react';

import { useAuth } from '@src/hooks/useAuth';
import { getApiBaseUrl, saveApiBaseUrl } from '@src/utils/api/apiSettings';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type AuthView = 'login' | 'register';

function SyncManager() {
  const [view, setView] = useState<AuthView>('login');
  const [apiBaseUrl, setApiBaseUrl] = useState(() => getApiBaseUrl() ?? '');

  const { user, logout, isLoading } = useAuth();

  const handleBaseUrlSave = () => {
    saveApiBaseUrl(apiBaseUrl);
    alert('API URL saved!');
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-xl mx-auto p-6 text-slate-800 dark:text-slate-200">
        <h2 className="text-2xl font-semibold mb-6">Sync Manager</h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm text-center">
          <p className="text-slate-500 dark:text-slate-400">Loading Account...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="w-full max-w-xl mx-auto p-6 text-slate-800 dark:text-slate-200">
        <h2 className="text-2xl font-semibold mb-6">Sync Manager</h2>
        <section className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Account</h3>
          <p className="mb-2">
            You are logged in as: <strong className="text-sky-600 dark:text-sky-400">{user.email}</strong>
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Data synchronization is not yet implemented.
          </p>
          <button
            type="button"
            onClick={logout}
            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded transition-colors"
          >
            Logout
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto p-6 text-slate-800 dark:text-slate-200">
      <h2 className="text-2xl font-semibold mb-6">Sync Manager</h2>

      {/* --- API Settings Section --- */}
      <section className="mb-8">
        <h3 className="text-lg font-medium mb-4">API Settings</h3>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
          <label htmlFor="api-base-url" className="block text-sm font-medium mb-2">
            API Base URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              id="api-base-url"
              value={apiBaseUrl}
              onChange={e => {
                setApiBaseUrl(e.target.value);
              }}
              placeholder="http://localhost:3000"
              className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition-all text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 text-base"
            />
            <button
              type="button"
              onClick={handleBaseUrlSave}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white rounded transition-colors"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">The root URL for the T8D Sync Server.</p>
        </div>
      </section>

      {/* --- Auth Section --- */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm">
        {/* Tab buttons */}
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

        {/* Content Area */}
        <div>
          {view === 'login' && <LoginForm />}
          {view === 'register' && <RegisterForm />}
        </div>
      </div>
    </div>
  );
}

export default SyncManager;
