import { Router } from 'express';
import { create, list } from './threads.controller';
import { createThreadSchema, listThreadsSchema } from './threads.schema';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import commentsRouter from '../comments/comments.routes';

const router = Router({ mergeParams: true });

router.get('/', validate(listThreadsSchema), list);
router.post('/', authenticate, validate(createThreadSchema), create);

router.use('/:threadId/comments', commentsRouter);

export default router;
