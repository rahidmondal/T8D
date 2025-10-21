import { Router } from 'express';

import authRouter from './auth.routes.js';
import syncRouter from './sync.routes.js';
import userRouter from './user.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/user', userRouter);
apiRouter.use('/sync', syncRouter);

export default apiRouter;
