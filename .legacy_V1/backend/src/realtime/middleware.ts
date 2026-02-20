import { type User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { type ExtendedError, type Socket } from 'socket.io';

import { prisma } from '../db/client.js';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

// Events the SERVER sends to the CLIENT
export interface ServerToClientEvents {
  /**
   * The "Poke" signal. Tells the client to run its standard sync process.
   * Payload is empty because it's just a signal.
   */
  SYNC_POKE: () => void;
}

export interface ClientToServerEvents {
  ping: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface T8DSocketData {
  user: User;
}

export type T8DSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, T8DSocketData>;

export const socketAuthMiddleware = async (socket: T8DSocket, next: (err?: ExtendedError) => void) => {
  try {
    const token = socket.handshake.auth.token as string | undefined;

    if (!token) {
      next(new Error('Authentication error: Token missing'));
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('FATAL: JWT_SECRET missing during socket auth');
      next(new Error('Internal server error'));
      return;
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      next(new Error('Authentication error: User not found'));
      return;
    }

    socket.data.user = user;
    void socket.join(`user:${user.id}`);

    next();
  } catch (err) {
    console.warn('[WebSocket] Auth failed:', err instanceof Error ? err.message : err);
    next(new Error('Authentication error: Invalid token'));
  }
};
