import { configDotenv } from 'dotenv';
import Express from 'express';
import { PrismaClient } from './generated/prisma';

configDotenv();

const app = Express();
const prisma = new PrismaClient();

const PORT = Number(process.env.SERVER_PORT ?? 3000);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/', (_req, res) => {
  res.send('Hello from t8d-sync-server!');
});

const server = app.listen(PORT, () => {
  console.log(`[t8d-sync-server] Server is running at http://localhost:${PORT}`);
});

server.on('error', (error: Error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
