import cors from 'cors';
import { configDotenv } from 'dotenv';
import express, { type Express as ExpressApp, type Request, type Response } from 'express';
import passport from 'passport';

import { initializePassport } from './auth/passport.js';
import { disconnectPrisma } from './db/queries.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';

// --- 1.Initial Configuration ---
configDotenv();
initializePassport();
const app: ExpressApp = express();
const PORT = Number(process.env.SERVER_PORT ?? 3000);

// --- 2.Core Middleware ---
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// --- 3.API Routes ---
app.use('/api/v1', apiRouter);

// --- 4.Server Health ---
app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, message: 'Server is healthy' });
});

// --- 5.Error Handling ---
app.use(errorHandler);

// --- 6.Server Startup & Shutdown ---
const server = app.listen(PORT, () => {
  console.info(`[t8d-sync-server] Server is running at http://localhost:${String(PORT)}`);
});

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
