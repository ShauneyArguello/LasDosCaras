import { Router } from 'express';
import { create, list } from './comments.controller';
import { createCommentSchema, listCommentsSchema } from './comments.schema';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';

const router = Router({ mergeParams: true });

router.get('/', validate(listCommentsSchema), list);
router.post('/', authenticate, validate(createCommentSchema), create);

export default router;
