import { useState } from 'react';

import { useAuth } from '@src/hooks/useAuth';
import { apiClient } from '@src/utils/api/apiClient';
import { getApiBaseUrl, saveApiBaseUrl } from '@src/utils/api/apiSettings';
import { queueAllLocalData } from '@src/utils/sync/syncManager';
import { getSyncEnabled, setSyncEnabled } from '@src/utils/sync/syncSettings';

import EditUserForm from './EditUserForm';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type AuthView = 'login' | 'register';

interface SyncResponse {
  message: string;
  userId: string;
  email: string;
}

function SyncManager() {
  const [view, setView] = useState<AuthView>('login');
  const [apiBaseUrl, setApiBaseUrl] = useState(() => getApiBaseUrl() ?? '');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [apiSaverError, setApiSaverError] = useState<string | null>(null);
  const [apiSaverSuccess, setApiSaverSuccess] = useState<string | null>(null);
  const [isSyncEnabled, setIsSyncEnabled] = useState<boolean>(getSyncEnabled());
  const [isSyncInitializing, setIsSyncInitializing] = useState(false);

  const { user, logout, isLoading } = useAuth();

  const handleBaseUrlSave = () => {
    setApiSaverError(null);
    setApiSaverSuccess(null);
    const trimmedUrl = apiBaseUrl.trim();
    if (!trimmedUrl) {
      setApiSaverError('API URL Cannot be empty');
      return;
    }

    try {
      new URL(trimmedUrl);

      saveApiBaseUrl(trimmedUrl);
      setApiSaverSuccess('API URL Saved');
    } catch (err) {
      setApiSaverError('Invalid URL. Must include http:// or https://');
      console.error(err);
    }
  };

  const handleTestSync = async () => {
    setTestResult('Testing...');
    try {
      const data = await apiClient<SyncResponse>('/api/v1/sync');
      if (data) {
        setTestResult(`Success: ${data.message} (User: ${data.email})`);
      }
    } catch (err) {
      if (err instanceof Error) {
        setTestResult(`Error: ${err.message}`);
      } else {
        setTestResult('An unknown error occurred.');
      }
    }
  };

  const handleSyncToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setIsSyncEnabled(newValue);
    setSyncEnabled(newValue);

    if (newValue) {
      setIsSyncInitializing(true);
      try {
        await queueAllLocalData();
      } finally {
        setIsSyncInitializing(false);
      }
    }
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
    if (isEditing) {
      return (
        <div className="w-full max-w-xl mx-auto p-6 text-slate-800 dark:text-slate-200">
          <h2 className="text-2xl font-semibold mb-6">Sync Manager</h2>
          <section className="bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <EditUserForm
              onDone={() => {
                setIsEditing(false);
              }}
            />
          </section>
        </div>
      );
    }

    return (
      <div className="w-full max-w-xl mx-auto p-6 text-slate-800 dark:text-slate-200">
        <h2 className="text-2xl font-semibold mb-6">Sync Manager</h2>
        <section className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Account</h3>
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
              }}
              className="px-3 py-1 text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded transition-colors"
            >
              Edit Profile
            </button>
          </div>
          <hr className="border-slate-200 dark:border-slate-700" />
          <div>
            <h3 className="text-lg font-medium mb-3">Sync Settings</h3>
            <div className="flex items-center justify-between">
              <label htmlFor="sync-toggle" className="text-slate-700 dark:text-slate-300 font-medium">
                Enable Synchronization
              </label>
              <div className="flex items-center gap-2">
                {isSyncInitializing && <span className="text-xs text-slate-500 animate-pulse">Initializing...</span>}
                <label
                  className={`relative inline-flex items-center ${isSyncInitializing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                >
                  <input
                    id="sync-toggle"
                    type="checkbox"
                    className="sr-only peer"
                    checked={isSyncEnabled}
                    onChange={e => {
                      void handleSyncToggle(e);
                    }}
                    disabled={isSyncInitializing}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 dark:peer-focus:ring-sky-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-sky-600"></div>
                </label>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {isSyncEnabled
                ? 'Your tasks will be synced with the server.'
                : 'Sync is disabled. Your tasks are only stored on this device.'}
            </p>
          </div>
          <hr className="border-slate-200 dark:border-slate-700" />
          <p>
            Logged in as: <strong className="text-sky-600 dark:text-sky-400">{user.email}</strong>
            <br />
            Name: <strong className="text-sky-600 dark:text-sky-400">{user.name || 'Not set'}</strong>
          </p>

          <button
            type="button"
            onClick={() => void handleTestSync()}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded transition-colors"
          >
            Test Connection
          </button>
          {testResult && <p className="text-sm text-slate-600 dark:text-slate-300 text-center">{testResult}</p>}

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
          {apiSaverSuccess && <p className="text-xs text-green-600 dark:text-green-400 mt-2">{apiSaverSuccess}</p>}
          {apiSaverError && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{apiSaverError}</p>}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">The root URL for the T8D Sync Server.</p>
        </div>
      </section>

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
