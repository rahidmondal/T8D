import { createContext } from 'react';

export interface SyncContextType {
  isSyncing: boolean;
  setSyncing: (isSyncing: boolean) => void;
  isSyncEnabled: boolean;
  setIsSyncEnabled: (isEnabled: boolean) => void;
  lastSyncTimestamp: number;
  triggerSyncRefresh: () => void;
}

export const SyncContext = createContext<SyncContextType | undefined>(undefined);
