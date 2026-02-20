import { Router, type Request, type Response } from 'express';

import { loginUser, registerUser } from '../auth/auth.controller.js';

const authRouter = Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/logout', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Logout successful' });
});

export default authRouter;
