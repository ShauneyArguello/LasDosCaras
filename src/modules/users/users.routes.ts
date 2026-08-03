import { Router } from 'express';
import { meFavorites } from './users.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/me/favorites', authenticate, meFavorites);

export default router;
