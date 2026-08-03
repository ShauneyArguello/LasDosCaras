import { Router } from 'express';
import { dislike, like } from './reactions.controller';
import { sideReactionSchema } from './reactions.schema';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';

const router = Router({ mergeParams: true });

router.post('/:side/like', authenticate, validate(sideReactionSchema), like);
router.post('/:side/dislike', authenticate, validate(sideReactionSchema), dislike);

export default router;
