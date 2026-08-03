import { Router } from 'express';
import { create, list, remove, update } from './adminCategories.controller';
import { categoryIdSchema, createCategorySchema, updateCategorySchema } from '../categories/categories.schema';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

router.use(authenticate, requireRole('SUPERADMIN'));

router.get('/', list);
router.post('/', validate(createCategorySchema), create);
router.put('/:id', validate(updateCategorySchema), update);
router.delete('/:id', validate(categoryIdSchema), remove);

export default router;
