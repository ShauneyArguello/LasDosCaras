import { Router } from 'express';
import { createCategory, getCategory, listCategories, updateCategory } from './categories.controller';
import { categoryIdSchema, createCategorySchema, updateCategorySchema } from './categories.schema';
import { validate } from '../../middleware/validate';

const router = Router();

router.get('/', listCategories);
router.get('/:id', validate(categoryIdSchema), getCategory);
router.post('/', validate(createCategorySchema), createCategory);
router.put('/:id', validate(updateCategorySchema), updateCategory);


export default router;
