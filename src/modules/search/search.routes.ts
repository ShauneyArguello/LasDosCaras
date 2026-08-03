import { Router } from 'express';
import { search } from './search.controller';
import { searchSchema } from './search.schema';
import { validate } from '../../middleware/validate';

const router = Router();

router.get('/', validate(searchSchema), search);

export default router;
