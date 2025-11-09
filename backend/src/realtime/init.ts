import { createServer, type Server as HttpServer } from 'http';

import { type Express } from 'express';
import { Server as SocketIOServer } from 'socket.io';

import { getAllowedOrigins } from '../utils/cors.js';

let io: SocketIOServer | undefined;

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

  io.on('connection', socket => {
    console.info(`[WebSocket] Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.info(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  // Nicer logging for arrays
  const originLog = Array.isArray(allowedOrigins) ? allowedOrigins.join(', ') : allowedOrigins;
  console.info(`[WebSocket] Initialized (Allowed Origins: ${originLog})`);
  return httpServer;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};
