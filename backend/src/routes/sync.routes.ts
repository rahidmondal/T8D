import { type User } from '@prisma/client'; // Import User type
import { Router, type Request, type Response } from 'express';

import { authenticateJwt } from '../auth/passport.js';
import { bootstrap, pullChanges, pushChanges } from '../sync/sync.controller.js';

const syncRouter = Router();

syncRouter.use(authenticateJwt);

syncRouter.post('/push', pushChanges);
syncRouter.get('/pull', pullChanges);
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
