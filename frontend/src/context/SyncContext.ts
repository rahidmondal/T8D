import { createContext } from 'react';

export interface SyncContextType {
  isSyncing: boolean;
  setSyncing: (isSyncing: boolean) => void;
  isSyncEnabled: boolean;
  setIsSyncEnabled: (isEnabled: boolean) => void;
}

export const SyncContext = createContext<SyncContextType | undefined>(undefined);
