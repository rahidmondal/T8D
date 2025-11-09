import { createServer, type Server as HttpServer } from 'http';

import { type Express } from 'express';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | undefined;

export const initializeSocketIO = (app: Express): HttpServer => {
  const httpServer = createServer(app);

  const allowedOrigin = process.env.CORS_ORIGIN ?? '*';

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigin,
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

  console.info(`[WebSocket] Initialized (Allowed Origin: ${allowedOrigin})`);
  return httpServer;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized!');
  }
  return io;
};
