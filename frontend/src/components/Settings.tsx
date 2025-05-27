import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="w-full max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>
      <section className="mb-8">
        <h3 className="text-lg font-medium mb-4">Theme Settings</h3>
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 shadow-sm">
          <span className="text-gray-700 font-medium">Dark Mode</span>
          <button
            type="button"
            aria-pressed={darkMode}
            onClick={() => setDarkMode((prev) => !prev)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              darkMode ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                darkMode ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          (Theme change will be available soon)
        </p>
      </section>
    </div>
  );
};

export default Settings;
