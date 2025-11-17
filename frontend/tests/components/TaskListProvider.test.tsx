import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

import type { ReactNode } from 'react';

import TaskListProvider from '@src/components/TaskListProvider';
import { SyncContext, SyncContextType } from '@src/context/SyncContext';
import { useTaskLists } from '@src/hooks/useTaskLists';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const LAST_ACTIVE_LIST_KEY = 't8d-last-active-list';

vi.mock('@src/utils/sync/syncManager', () => ({
  pushTaskChange: vi.fn().mockResolvedValue(undefined),
  pushTaskDelete: vi.fn().mockResolvedValue(undefined),
  pushListChange: vi.fn().mockResolvedValue(undefined),
  pushListDelete: vi.fn().mockResolvedValue(undefined),
}));

const setupCryptoMock = () => {
  const mockDigest = vi.fn().mockImplementation((_algorithm: string, data: Uint8Array) => {
    const hash = new Uint8Array(32);
    hash[0] = data.length % 256;
    return Promise.resolve(hash.buffer);
  });

  Object.defineProperty(global, 'crypto', {
    value: {
      subtle: {
        digest: mockDigest,
      },
    },
    writable: true,
  });
};

const createSyncContextValue = (): SyncContextType => ({
  isSyncing: false,
  setSyncing: vi.fn(),
  isSyncEnabled: false,
  setIsSyncEnabled: vi.fn(),
  lastSyncTimestamp: 0,
  triggerSyncRefresh: vi.fn(),
});

const TestConsumer = () => {
  const { taskLists, activeListId, isLoading, addTaskList } = useTaskLists();
  const latestListName = taskLists.length > 0 ? taskLists[taskLists.length - 1].name : 'none';

  return (
    <div>
      <span data-testid="loading-state">{isLoading ? 'loading' : 'ready'}</span>
      <span data-testid="task-count">{taskLists.length}</span>
      <span data-testid="active-list-id">{activeListId ?? 'none'}</span>
      <span data-testid="latest-list-name">{latestListName}</span>
      <button
        data-testid="add-list"
        onClick={() => {
          void addTaskList('Second List');
        }}
      >
        add
      </button>
    </div>
  );
};

const renderWithProviders = (children: ReactNode) => {
  return render(
    <SyncContext.Provider value={createSyncContextValue()}>
      <TaskListProvider>{children}</TaskListProvider>
    </SyncContext.Provider>,
  );
};

describe('TaskListProvider', () => {
  beforeEach(() => {
    global.indexedDB = new IDBFactory();
    localStorage.clear();
    setupCryptoMock();
  });

  afterEach(async () => {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) {
        indexedDB.deleteDatabase(db.name);
      }
    }
    vi.clearAllMocks();
  });

  it('creates a default list when none exist and persists the active list id', async () => {
    renderWithProviders(<TestConsumer />);

    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe('ready');
    });

    expect(screen.getByTestId('task-count').textContent).toBe('1');
    expect(screen.getByTestId('latest-list-name').textContent).toBe('Default List');

    const activeListId = screen.getByTestId('active-list-id').textContent;
    expect(activeListId).not.toBe('none');
    expect(localStorage.getItem(LAST_ACTIVE_LIST_KEY)).toBe(activeListId);
  });

  it('sets the newly created list as active and updates persistence', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestConsumer />);

    await waitFor(() => {
      expect(screen.getByTestId('loading-state').textContent).toBe('ready');
    });
    const initialActiveId = screen.getByTestId('active-list-id').textContent;

    await user.click(screen.getByTestId('add-list'));

    await waitFor(() => {
      expect(screen.getByTestId('task-count').textContent).toBe('2');
    });
    expect(screen.getByTestId('latest-list-name').textContent).toBe('Second List');

    const updatedActiveId = screen.getByTestId('active-list-id').textContent;
    expect(updatedActiveId).not.toBe('none');
    expect(updatedActiveId).not.toBe(initialActiveId);
    expect(localStorage.getItem(LAST_ACTIVE_LIST_KEY)).toBe(updatedActiveId);
  });
});
