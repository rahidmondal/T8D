import React, { useEffect, useState } from 'react';

import { RealtimeContext } from '../context/RealtimeContext';
import { useAuth } from '../hooks/useAuth';
import { disconnectSocket, initializeSocket, T8DSocket } from '../utils/realtime/socket';
import { performSync } from '../utils/sync/syncManager';

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<T8DSocket | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let activeSocket: T8DSocket | undefined;

    if (user) {
      activeSocket = initializeSocket();
      setSocket(activeSocket);

      if (activeSocket) {
        setIsConnected(activeSocket.connected);

        activeSocket.on('connect', () => {
          setIsConnected(true);
        });
        activeSocket.on('disconnect', () => {
          setIsConnected(false);
        });

        activeSocket.on('SYNC_POKE', async () => {
          console.info('[Realtime] Received Poke 👉. Syncing...');
          try {
            await performSync();
            console.info('[Realtime] Sync triggered by Poke complete.');
          } catch (err) {
            console.error('[Realtime] Failed to sync after poke:', err);
          }
        });
      }
    } else {
      disconnectSocket();
      setSocket(undefined);
      setIsConnected(false);
    }

    return () => {
      if (activeSocket) {
        activeSocket.off('connect');
        activeSocket.off('disconnect');
        activeSocket.off('SYNC_POKE');
      }
    };
  }, [user]);

  return <RealtimeContext.Provider value={{ isConnected, socket }}>{children}</RealtimeContext.Provider>;
};
