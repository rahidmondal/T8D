import { type User } from '@prisma/client';
import { Router, type Request, type Response } from 'express';

import { authenticateJwt } from '../auth/passport.js';

const syncRouter = Router();

syncRouter.get('/', authenticateJwt, (req: Request, res: Response) => {
  const user = req.user as User;
  res.status(200).json({
    message: 'Sync successful',
    userId: user.id,
    email: user.email,
  });
});

export default syncRouter;
