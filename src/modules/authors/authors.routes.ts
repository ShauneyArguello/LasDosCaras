import { Router } from 'express';
import { getOne } from './authors.controller';
import { authorIdSchema } from './authors.schema';
import { validate } from '../../middleware/validate';

const router = Router();

router.get('/:id', validate(authorIdSchema), getOne);

export default router;
