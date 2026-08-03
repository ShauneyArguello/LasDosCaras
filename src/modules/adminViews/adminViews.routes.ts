import { Router } from 'express';
import { list } from './adminViews.controller';
import { listAdminViewsSchema } from './adminViews.schema';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, requireRole('SUPERADMIN'), validate(listAdminViewsSchema), list);

export default router;
