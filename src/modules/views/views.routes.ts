import { Router } from 'express';
import { create, getOne, list, publish, unpublish, update } from './views.controller';
import { createViewSchema, listViewsSchema, updateViewSchema, viewIdSchema } from './views.schema';
import { validate } from '../../middleware/validate';
import { authenticate, optionalAuthenticate, requireRole } from '../../middleware/auth';
import reactionsRouter from '../reactions/reactions.routes';
import favoritesRouter from '../favorites/favorites.routes';
import threadsRouter from '../threads/threads.routes';

const router = Router();

router.get('/', optionalAuthenticate, validate(listViewsSchema), list);
router.post('/', authenticate, validate(createViewSchema), create);
router.get('/:id', optionalAuthenticate, validate(viewIdSchema), getOne);
router.put('/:id', authenticate, validate(updateViewSchema), update);
router.patch('/:id/unpublish', authenticate, requireRole('SUPERADMIN'), validate(viewIdSchema), unpublish);
router.patch('/:id/publish', authenticate, requireRole('SUPERADMIN'), validate(viewIdSchema), publish);

router.use('/:id/sides', reactionsRouter);
router.use('/:id/favorite', favoritesRouter);
router.use('/:id/threads', threadsRouter);

export default router;
