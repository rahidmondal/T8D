import { getApiBaseUrl, getToken } from '@src/utils/api/apiSettings';
import { io, Socket } from 'socket.io-client';

export interface ServerToClientEvents {
  SYNC_POKE: () => void;
}

export interface ClientToServerEvents {
  ping: () => void;
}

export type T8DSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: T8DSocket | undefined;

export const initializeSocket = (): T8DSocket | undefined => {
  if (socket?.connected) {
    return socket;
  }

  const baseUrl = getApiBaseUrl();
  const token = getToken();

  if (!baseUrl || !token) {
    return undefined;
  }

  console.info('[Realtime] Initializing socket connection...');

  socket = io(baseUrl, {
    auth: {
      token: token,
    },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.info(`[Realtime] Connected with ID: ${socket?.id ?? 'unknown'}`);
  });

  socket.on('connect_error', err => {
    console.warn('[Realtime] Connection error:', err.message);
  });

  socket.on('disconnect', reason => {
    console.info('[Realtime] Disconnected:', reason);
    if (reason === 'io server disconnect') {
      socket?.close();
      socket = undefined;
    }
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    console.info('[Realtime] Disconnecting...');
    socket.disconnect();
    socket = undefined;
  }
};

export const getSocket = (): T8DSocket | undefined => {
  return socket;
};
