import { Router } from 'express';
import { ban, list, unban } from './adminUsers.controller';
import { listUsersSchema, userIdSchema } from './adminUsers.schema';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

router.use(authenticate, requireRole('SUPERADMIN'));

router.get('/', validate(listUsersSchema), list);
router.patch('/:id/ban', validate(userIdSchema), ban);
router.patch('/:id/unban', validate(userIdSchema), unban);

export default router;
