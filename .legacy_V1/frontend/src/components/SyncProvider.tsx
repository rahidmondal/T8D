import React, { useCallback, useState } from 'react';

import { getSyncEnabled, setSyncEnabled } from '@src/utils/sync/syncSettings';

import { SyncContext } from '../context/SyncContext';

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSyncing, setIsSyncingState] = useState(false);

  const setSyncing = useCallback((syncState: boolean) => {
    setIsSyncingState(syncState);
  }, []);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState(() => Date.now());

  const [isSyncEnabled, setIsSyncEnabledState] = useState<boolean>(getSyncEnabled());

  const setIsSyncEnabled = useCallback((isEnabled: boolean) => {
    setSyncEnabled(isEnabled);
    setIsSyncEnabledState(isEnabled);
  }, []);

  const triggerSyncRefresh = useCallback(() => {
    setLastSyncTimestamp(Date.now());
  }, []);

  return (
    <SyncContext.Provider
      value={{ isSyncing, setSyncing, isSyncEnabled, setIsSyncEnabled, lastSyncTimestamp, triggerSyncRefresh }}
    >
      {children}
    </SyncContext.Provider>
  );
};
