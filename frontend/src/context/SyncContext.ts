import { createContext } from 'react';

export interface SyncContextType {
  isSyncing: boolean;
  setSyncing: (isSyncing: boolean) => void;
}

export const SyncContext = createContext<SyncContextType | undefined>(undefined);
