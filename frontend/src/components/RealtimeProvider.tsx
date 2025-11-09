import React, { useEffect, useRef, useState } from 'react';

import { RealtimeContext } from '../context/RealtimeContext';
import { useAuth } from '../hooks/useAuth';
import { disconnectSocket, initializeSocket, T8DSocket } from '../utils/realtime/socket';
import { performSync } from '../utils/sync/syncManager';

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<T8DSocket | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);

  const attachedSocketRef = useRef<T8DSocket | undefined>(undefined);

  useEffect(() => {
    if (user) {
      const socketInstance = initializeSocket();
      setSocket(socketInstance);

      if (socketInstance && socketInstance !== attachedSocketRef.current) {
        if (attachedSocketRef.current) {
          attachedSocketRef.current.off('connect');
          attachedSocketRef.current.off('disconnect');
          attachedSocketRef.current.off('SYNC_POKE');
        }

        attachedSocketRef.current = socketInstance;
        setIsConnected(socketInstance.connected);

        const onConnect = () => {
          setIsConnected(true);
        };
        const onDisconnect = () => {
          setIsConnected(false);
        };
        const onPoke = async () => {
          console.info('[Realtime] Received Poke 👉. Syncing...');
          try {
            await performSync();
            console.info('[Realtime] Sync triggered by Poke complete.');
          } catch (err) {
            console.error('[Realtime] Failed to sync after poke:', err);
          }
        };

        socketInstance.on('connect', onConnect);
        socketInstance.on('disconnect', onDisconnect);
        socketInstance.on('SYNC_POKE', onPoke);
      }
    } else {
      if (attachedSocketRef.current) {
        attachedSocketRef.current.off('connect');
        attachedSocketRef.current.off('disconnect');
        attachedSocketRef.current.off('SYNC_POKE');
        attachedSocketRef.current = undefined;
      }
      disconnectSocket();
      setSocket(undefined);
      setIsConnected(false);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (attachedSocketRef.current) {
        attachedSocketRef.current.off('connect');
        attachedSocketRef.current.off('disconnect');
        attachedSocketRef.current.off('SYNC_POKE');
      }
    };
  }, []);

  return <RealtimeContext.Provider value={{ isConnected, socket }}>{children}</RealtimeContext.Provider>;
};
