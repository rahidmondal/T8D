import { createServer, type Server as HttpServer } from 'http';

import { type Express } from 'express';
import { Server as SocketIOServer } from 'socket.io';

import { getAllowedOrigins } from '../utils/cors.js';

import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  socketAuthMiddleware,
  T8DSocketData,
} from './middleware.js';

export type T8DServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, T8DSocketData>;

let io: T8DServer | undefined;

export const initializeSocketIO = (app: Express): HttpServer => {
  const httpServer = createServer(app);
  const allowedOrigins = getAllowedOrigins();

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    void socketAuthMiddleware(socket, next);
  });

  io.on('connection', socket => {
    console.info(`[WebSocket] User connected: ${socket.data.user.email} (${socket.id})`);

    socket.on('disconnect', () => {
      console.info(`[WebSocket] User disconnected: ${socket.data.user.email} (${socket.id})`);
    });
  });

  const originLog = Array.isArray(allowedOrigins) ? allowedOrigins.join(', ') : allowedOrigins;
  console.info(`[WebSocket] Initialized (Allowed Origins: ${originLog})`);
  return httpServer;
};

export const getIO = (): T8DServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};
