import { createContext } from 'react';

import { T8DSocket } from '../utils/realtime/socket';

interface RealtimeContextType {
  isConnected: boolean;
  socket: T8DSocket | undefined;
}

export const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);
