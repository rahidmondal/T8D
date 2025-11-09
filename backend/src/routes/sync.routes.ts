import { type User } from '@prisma/client';
import { Router, type Request, type Response } from 'express';

import { authenticateJwt } from '../auth/passport.js';
import { bootstrap, syncMain } from '../sync/sync.controller.js';

const syncRouter = Router();

syncRouter.use(authenticateJwt);

syncRouter.post('/', syncMain);
syncRouter.get('/bootstrap', bootstrap);

syncRouter.get('/', (req: Request, res: Response) => {
  const user = req.user as User;

  res.status(200).json({
    message: 'Sync service is online',
    userId: user.id,
    email: user.email,
  });
});

export default syncRouter;
