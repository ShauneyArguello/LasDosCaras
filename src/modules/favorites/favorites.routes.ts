import { Router } from 'express';
import { favorite, unfavorite } from './favorites.controller';
import { favoriteViewSchema } from './favorites.schema';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';

const router = Router({ mergeParams: true });

router.post('/', authenticate, validate(favoriteViewSchema), favorite);
router.delete('/', authenticate, validate(favoriteViewSchema), unfavorite);

export default router;
