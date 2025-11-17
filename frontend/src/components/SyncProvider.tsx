import React, { useCallback, useState } from 'react';

import { getSyncEnabled, setSyncEnabled } from '@src/utils/sync/syncSettings';

import { SyncContext } from '../context/SyncContext';

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSyncing, setIsSyncingState] = useState(false);

  const setSyncing = useCallback((syncState: boolean) => {
    setIsSyncingState(syncState);
  }, []);

  const [isSyncEnabled, setIsSyncEnabledState] = useState<boolean>(getSyncEnabled());

  const setIsSyncEnabled = useCallback((isEnabled: boolean) => {
    setSyncEnabled(isEnabled);
    setIsSyncEnabledState(isEnabled);
  }, []);

  return (
    <SyncContext.Provider value={{ isSyncing, setSyncing, isSyncEnabled, setIsSyncEnabled }}>
      {children}
    </SyncContext.Provider>
  );
};
