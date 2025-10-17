import { configDotenv } from 'dotenv';
import Express from 'express';
import { createUser, deleteUser, disconnectPrisma, getAllUsers, getUserById, updateUser } from './db/queries.js';
configDotenv();

const app = Express();
app.use(Express.json());

const PORT = Number(process.env.SERVER_PORT ?? 3000);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/', (_req, res) => {
  res.send('Hello from t8d-sync-server!');
});

app.get('/users', async (_req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const user = await deleteUser(req.params.id);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`[t8d-sync-server] Server is running at http://localhost:${PORT}`);
});

const shutdown = async () => {
  console.log('Shutting down server...');
  await disconnectPrisma();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.on('error', (error: Error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
