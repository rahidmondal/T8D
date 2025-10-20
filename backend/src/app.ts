import cors from 'cors';
import { configDotenv } from 'dotenv';
import express, { type Express as ExpressApp, type Request, type Response } from 'express';
import passport from 'passport';

import { registerUser } from './auth/auth.controller.js';
import { disconnectPrisma } from './db/queries.js';

// --- 1.Initial Configuration ---
configDotenv();
const app: ExpressApp = express();
const PORT = Number(process.env.SERVER_PORT ?? 3000);

// --- 2.Core Middleware ---
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// -- 3.Authentication Routes ---
app.post('/api/v1/auth/register', registerUser);

app.post('/api/v1/auth/login', (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Not Implemented' });
});

app.post('/api/v1/auth/logout', (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Not Implemented' });
});

// --- 4.Users Routes ---
app.put('/api/v1/user/edit', (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Not Implemented' });
});

// --- 5.Protected Routes ---
app.get('/api/v1/sync', (_req: Request, res: Response) => {
  res.status(501).json({ message: 'Not Implemented' });
});

// --- 6.Server Health & Startup ---
app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, message: 'Server is healthy' });
});

const server = app.listen(PORT, () => {
  console.info(`[t8d-sync-server] Server is running at http://localhost:${String(PORT)}`);
});

// --- 7.Graceful Shutdown Logic ---

const shutdown = async () => {
  console.info('Shutting down server...');
  await disconnectPrisma();
  server.close(() => {
    console.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', () => {
  void shutdown();
});
process.on('SIGTERM', () => {
  void shutdown();
});

server.on('error', (err: unknown) => {
  if (err instanceof Error) {
    console.error('Failed to start server:', err.message);
  } else {
    console.error('Failed to start server (non-Error):', err);
  }
  process.exit(1);
});
