import { Router } from 'express';

import { editUser } from '../auth/auth.controller.js';
import { authenticateJwt } from '../auth/passport.js';

const userRouter = Router();

userRouter.patch('/edit', authenticateJwt, editUser);

export default userRouter;
