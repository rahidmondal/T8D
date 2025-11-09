import React, { useCallback, useState } from 'react';

import { SyncContext } from '../context/SyncContext';

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSyncing, setIsSyncingState] = useState(false);

  const setSyncing = useCallback((syncState: boolean) => {
    setIsSyncingState(syncState);
  }, []);

  return <SyncContext.Provider value={{ isSyncing, setSyncing }}>{children}</SyncContext.Provider>;
};
