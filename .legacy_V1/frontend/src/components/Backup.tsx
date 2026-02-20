import React, { useRef, useState } from 'react';

import { exportTasksToJson, importTasksFromJson } from '@src/utils/backup/backup';

export function Backup() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replaceAll, setReplaceAll] = useState(false);

  const handleExport = async () => {
    const json = await exportTasksToJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      await importTasksFromJson(text, replaceAll);
      alert('Tasks imported successfully!');
    } catch (error) {
      alert((error as Error).message);
    }
    event.target.value = '';
  };

  return (
    <section className="mb-8">
      <h3 className="text-lg font-medium mb-4">Backup & Restore</h3>
      <div className="flex gap-4 mb-2">
        <button
          type="button"
          onClick={() => {
            void handleExport();
          }}
          className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 transition"
        >
          Export Tasks
        </button>
        <label className="px-4 py-2 rounded bg-slate-300 text-slate-800 hover:bg-slate-400 transition cursor-pointer">
          Import Tasks
          <input
            type="file"
            accept="application/json"
            ref={fileInputRef}
            onChange={event => {
              void handleImport(event);
            }}
            className="hidden"
          />
        </label>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          id="replaceAll"
          checked={replaceAll}
          onChange={e => {
            setReplaceAll(e.target.checked);
          }}
          className="accent-sky-600"
        />
        <label htmlFor="replaceAll" className="text-sm cursor-pointer">
          Replace all tasks (full backup restore)
        </label>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        Export your tasks to a JSON file or import tasks from a backup file.
        <br />
        <span className="font-semibold">Replace all:</span> If checked, all existing tasks will be deleted before
        import.
      </p>
    </section>
  );
}
