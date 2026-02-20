import { useContext } from 'react';

import { SyncContext, type SyncContextType } from '../context/SyncContext';

export const useSyncState = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncState must be used within a SyncProvider');
  }
  return context;
};
